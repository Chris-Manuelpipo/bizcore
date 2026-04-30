package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Actor;
import com.bizcore.bizcore_backend.domain.Invoice;
import com.bizcore.bizcore_backend.domain.ServiceCatalogue;
import com.bizcore.bizcore_backend.domain.ServiceRequest;
import com.bizcore.bizcore_backend.dto.FulfillResponseDTO;
import com.bizcore.bizcore_backend.dto.InvoiceDTO;
import com.bizcore.bizcore_backend.dto.ServiceRequestDTO;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.repository.ActorRepository;
import com.bizcore.bizcore_backend.repository.InvoiceRepository;
import com.bizcore.bizcore_backend.repository.ServiceCatalogueRepository;
import com.bizcore.bizcore_backend.repository.ServiceRequestRepository;
import com.bizcore.bizcore_backend.security.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class ServiceRequestService {

    // Table de routage FSM — analogie : table de routage réseau
    private static final Map<ServiceRequest.Status, List<ServiceRequest.Status>> VALID_TRANSITIONS =
            Map.of(
                ServiceRequest.Status.PENDING,     List.of(ServiceRequest.Status.ACCEPTED, ServiceRequest.Status.CANCELLED),
                ServiceRequest.Status.ACCEPTED,    List.of(ServiceRequest.Status.IN_PROGRESS, ServiceRequest.Status.CANCELLED),
                ServiceRequest.Status.IN_PROGRESS, List.of(ServiceRequest.Status.FULFILLED, ServiceRequest.Status.CANCELLED),
                ServiceRequest.Status.FULFILLED,   List.of(),
                ServiceRequest.Status.CANCELLED,   List.of()
            );

    private final ServiceRequestRepository serviceRequestRepository;
    private final ActorRepository actorRepository;
    private final ServiceCatalogueRepository serviceCatalogueRepository;
    private final InvoiceRepository invoiceRepository;
    private final AuditService auditService;

    public ServiceRequestService(ServiceRequestRepository serviceRequestRepository,
                                 ActorRepository actorRepository,
                                 ServiceCatalogueRepository serviceCatalogueRepository,
                                 InvoiceRepository invoiceRepository,
                                 AuditService auditService) {
        this.serviceRequestRepository = serviceRequestRepository;
        this.actorRepository = actorRepository;
        this.serviceCatalogueRepository = serviceCatalogueRepository;
        this.invoiceRepository = invoiceRepository;
        this.auditService = auditService;
    }

    // ── Lecture tenant-aware ──────────────────────────────────────────────────

    public Page<ServiceRequest> findAll(Pageable pageable) {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId != null) {
            return serviceRequestRepository.findAllByTenantId(tenantId, pageable);
        }
        return serviceRequestRepository.findAll(pageable);
    }

    public Optional<ServiceRequest> findById(UUID id) {
        return serviceRequestRepository.findById(id);
    }

    public List<ServiceRequest> findByConsumer(UUID consumerId) {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId != null) {
            return serviceRequestRepository.findByConsumerIdAndTenantId(consumerId, tenantId);
        }
        return serviceRequestRepository.findByConsumerId(consumerId);
    }

    public List<ServiceRequest> findByProvider(UUID providerId) {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId != null) {
            return serviceRequestRepository.findByProviderIdAndTenantId(providerId, tenantId);
        }
        return serviceRequestRepository.findByProviderId(providerId);
    }

    public List<ServiceRequest> findByStatus(ServiceRequest.Status status) {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId != null) {
            return serviceRequestRepository.findByStatusAndTenantId(status, tenantId);
        }
        return serviceRequestRepository.findByStatus(status);
    }

    // ── Création ──────────────────────────────────────────────────────────────

    /**
     * Crée une ServiceRequest (paquet réseau CdS → FdS).
     * - requestedAt est géré par @PrePersist sur ServiceRequest
     * - correlationId est géré par @PrePersist si non fourni
     * - tenant hérité du consumer (jamais fourni par le client)
     */
    public ServiceRequest save(UUID consumerId, UUID providerId,
                               UUID serviceCatalogueId, ServiceRequest request) {
        Actor consumer = actorRepository.findById(consumerId)
                .orElseThrow(() -> new ResourceNotFoundException("Actor (consumer)", consumerId.toString()));
        Actor provider = actorRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Actor (provider)", providerId.toString()));
        ServiceCatalogue catalogue = serviceCatalogueRepository.findById(serviceCatalogueId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceCatalogue", serviceCatalogueId.toString()));

        request.setConsumer(consumer);
        request.setProvider(provider);
        request.setServiceCatalogue(catalogue);
        request.setStatus(ServiceRequest.Status.PENDING);
        request.setTraceId(UUID.randomUUID());

        // Tenant hérité du consumer via son User (jamais surchargeable par le client)
        if (consumer.getUser() != null && consumer.getUser().getTenant() != null) {
            request.setTenant(consumer.getUser().getTenant());
        }

        ServiceRequest saved = serviceRequestRepository.save(request);
        
        // Logger la création dans l'audit trail
        auditService.logServiceRequestCreated(saved, consumerId);
        
        return saved;
    }

    // ── Transitions FSM ───────────────────────────────────────────────────────

    public ServiceRequest accept(UUID id, UUID actorId) {
        ServiceRequest sr = findAndValidateActor(id, actorId, "provider");
        transitionTo(sr, ServiceRequest.Status.ACCEPTED, actorId);
        sr.setAcceptedAt(java.time.LocalDateTime.now());
        return serviceRequestRepository.save(sr);
    }

    public ServiceRequest start(UUID id, UUID actorId) {
        ServiceRequest sr = findAndValidateActor(id, actorId, "provider");
        transitionTo(sr, ServiceRequest.Status.IN_PROGRESS, actorId);
        sr.setStartedAt(java.time.LocalDateTime.now());
        return serviceRequestRepository.save(sr);
    }

    /**
     * Marque la demande FULFILLED et génère automatiquement la facture (ACK réseau).
     * issuedAt sur Invoice est géré par @PrePersist — ne pas appeler setIssuedAt().
     */
    public FulfillResponseDTO fulfill(UUID id) {
        ServiceRequest sr = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest", id.toString()));

        transitionTo(sr, ServiceRequest.Status.FULFILLED, sr.getProvider().getId());
        sr.setFulfilledAt(java.time.LocalDateTime.now());
        serviceRequestRepository.save(sr);

        // Génération automatique de la facture (ACK)
        Invoice invoice = new Invoice();
        invoice.setServiceRequest(sr);
        invoice.setStatus(Invoice.Status.PENDING);
        // issuedAt : géré par @PrePersist → NE PAS appeler setIssuedAt()

        // Prix depuis le catalogue si disponible
        if (sr.getServiceCatalogue() != null && sr.getServiceCatalogue().getBasePrice() != null) {
            invoice.setAmount(sr.getServiceCatalogue().getBasePrice());
            invoice.setCurrency(sr.getServiceCatalogue().getCurrency() != null
                    ? sr.getServiceCatalogue().getCurrency() : "XAF");
        } else {
            invoice.setCurrency("XAF");
        }

        Invoice saved = invoiceRepository.save(invoice);

        return new FulfillResponseDTO(
                ServiceRequestDTO.fromEntity(sr),
                InvoiceDTO.fromEntity(saved)
        );
    }

    public ServiceRequest cancel(UUID id, UUID actorId) {
        ServiceRequest sr = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest", id.toString()));
        transitionTo(sr, ServiceRequest.Status.CANCELLED, actorId);
        sr.setCancelledAt(java.time.LocalDateTime.now());
        return serviceRequestRepository.save(sr);
    }

    public void deleteById(UUID id) {
        serviceRequestRepository.deleteById(id);
    }

    // ── Helpers privés ────────────────────────────────────────────────────────

    private void transitionTo(ServiceRequest sr, ServiceRequest.Status target, UUID actorId) {
        ServiceRequest.Status oldStatus = sr.getStatus();
        
        List<ServiceRequest.Status> allowed = VALID_TRANSITIONS.get(sr.getStatus());
        if (allowed == null || !allowed.contains(target)) {
            throw new IllegalStateException(
                    "Transition invalide : " + sr.getStatus() + " → " + target
                    + ". Transitions autorisées depuis cet état : " + allowed);
        }
        sr.setStatus(target);
        
        // Logger la transition dans l'audit trail - nouvelle transaction séparée
        auditService.logServiceRequestStatusChange(sr, oldStatus, actorId);
    }

    private ServiceRequest findAndValidateActor(UUID srId, UUID actorId, String expectedRole) {
        ServiceRequest sr = serviceRequestRepository.findById(srId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest", srId.toString()));
        actorRepository.findById(actorId)
                .orElseThrow(() -> new ResourceNotFoundException("Actor", actorId.toString()));

        boolean isProvider = sr.getProvider() != null && sr.getProvider().getId().equals(actorId);
        boolean isConsumer = sr.getConsumer() != null && sr.getConsumer().getId().equals(actorId);

        if ("provider".equals(expectedRole) && !isProvider) {
            throw new IllegalArgumentException(
                    "L'acteur " + actorId + " n'est pas le provider de cette demande.");
        }
        if ("consumer".equals(expectedRole) && !isConsumer) {
            throw new IllegalArgumentException(
                    "L'acteur " + actorId + " n'est pas le consumer de cette demande.");
        }
        return sr;
    }
}
