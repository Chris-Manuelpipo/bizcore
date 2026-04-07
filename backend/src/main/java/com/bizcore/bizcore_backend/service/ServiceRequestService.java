package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Actor;
import com.bizcore.bizcore_backend.domain.ServiceCatalogue;
import com.bizcore.bizcore_backend.domain.Invoice;
import com.bizcore.bizcore_backend.domain.ServiceRequest;
import com.bizcore.bizcore_backend.dto.FulfillResponseDTO;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.repository.ActorRepository;
import com.bizcore.bizcore_backend.repository.InvoiceRepository;
import com.bizcore.bizcore_backend.repository.ServiceCatalogueRepository;
import com.bizcore.bizcore_backend.repository.ServiceRequestRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@Service
public class ServiceRequestService {

    private static final String DEFAULT_CURRENCY = "XAF";

    private final ServiceRequestRepository serviceRequestRepository;
    private final ActorRepository actorRepository;
    private final InvoiceRepository invoiceRepository;
    private final ServiceCatalogueRepository serviceCatalogueRepository;

    private static final Map<ServiceRequest.Status, List<ServiceRequest.Status>> VALID_TRANSITIONS;

    static {
        VALID_TRANSITIONS = new HashMap<>();
        VALID_TRANSITIONS.put(ServiceRequest.Status.PENDING,
            List.of(ServiceRequest.Status.ACCEPTED, ServiceRequest.Status.CANCELLED));
        VALID_TRANSITIONS.put(ServiceRequest.Status.ACCEPTED,
            List.of(ServiceRequest.Status.IN_PROGRESS, ServiceRequest.Status.CANCELLED));
        VALID_TRANSITIONS.put(ServiceRequest.Status.IN_PROGRESS,
            List.of(ServiceRequest.Status.FULFILLED, ServiceRequest.Status.CANCELLED));
        VALID_TRANSITIONS.put(ServiceRequest.Status.FULFILLED, List.of());
        VALID_TRANSITIONS.put(ServiceRequest.Status.CANCELLED, List.of());
    }

    public ServiceRequestService(ServiceRequestRepository serviceRequestRepository,
                                 ActorRepository actorRepository,
                                 InvoiceRepository invoiceRepository,
                                 ServiceCatalogueRepository serviceCatalogueRepository) {
        this.serviceRequestRepository = serviceRequestRepository;
        this.actorRepository = actorRepository;
        this.invoiceRepository = invoiceRepository;
        this.serviceCatalogueRepository = serviceCatalogueRepository;
    }

    private void validateTransition(ServiceRequest request, ServiceRequest.Status newStatus) {
        ServiceRequest.Status currentStatus = request.getStatus();
        List<ServiceRequest.Status> allowedTransitions = VALID_TRANSITIONS.get(currentStatus);
        if (allowedTransitions == null || !allowedTransitions.contains(newStatus)) {
            throw new IllegalStateException(
                String.format("Invalid state transition: cannot transition from %s to %s.", currentStatus, newStatus));
        }
    }

    private void validateProvider(ServiceRequest request, UUID userActorId) {
        if (request.getProvider() == null || !request.getProvider().getId().equals(userActorId)) {
            throw new AccessDeniedException("Only the provider can perform this action.");
        }
    }

    private void validateConsumer(ServiceRequest request, UUID userActorId) {
        if (request.getConsumer() == null || !request.getConsumer().getId().equals(userActorId)) {
            throw new AccessDeniedException("Only the consumer can perform this action.");
        }
    }

    public Page<ServiceRequest> findAll(Pageable pageable) {
        return serviceRequestRepository.findAll(pageable);
    }

    public Optional<ServiceRequest> findById(UUID id) {
        return serviceRequestRepository.findById(id);
    }

    public List<ServiceRequest> findByConsumer(UUID consumerId) {
        return serviceRequestRepository.findByConsumerId(consumerId);
    }

    public List<ServiceRequest> findByProvider(UUID providerId) {
        return serviceRequestRepository.findByProviderId(providerId);
    }

    public List<ServiceRequest> findByStatus(ServiceRequest.Status status) {
        return serviceRequestRepository.findByStatus(status);
    }

    public ServiceRequest save(UUID consumerId, UUID providerId,
                               UUID serviceCatalogueId, ServiceRequest request) {
        if (consumerId.equals(providerId)) {
            throw new IllegalArgumentException("Un utilisateur ne peut pas être à la fois le consommateur et le fournisseur du même service.");
        }

        Actor consumer = actorRepository.findById(consumerId)
                .orElseThrow(() -> new ResourceNotFoundException("Actor (consumer)", consumerId.toString()));
        Actor provider = actorRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Actor (provider)", providerId.toString()));
        ServiceCatalogue catalogue = serviceCatalogueRepository.findById(serviceCatalogueId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceCatalogue", serviceCatalogueId.toString()));

        request.setConsumer(consumer);
        request.setProvider(provider);
        request.setServiceCatalogue(catalogue);
        request.setServiceName(catalogue.getName());
        return serviceRequestRepository.save(request);
    }

    @Transactional
    public FulfillResponseDTO fulfill(UUID id) {
        ServiceRequest request = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest", id.toString()));
        validateTransition(request, ServiceRequest.Status.FULFILLED);

        if (invoiceRepository.findByServiceRequestId(id).isPresent()) {
            throw new IllegalStateException("An invoice already exists for this service request.");
        }

        ServiceCatalogue catalogue = request.getServiceCatalogue();
        BigDecimal amount = catalogue.getBasePrice();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Invalid invoice amount: must be greater than 0.");
        }

        String currency = catalogue.getCurrency();
        if (currency == null || currency.isBlank()) {
            currency = DEFAULT_CURRENCY;
        }

        request.setStatus(ServiceRequest.Status.FULFILLED);
        request.setFulfilledAt(LocalDateTime.now());
        serviceRequestRepository.save(request);

        Invoice invoice = new Invoice();
        invoice.setServiceRequest(request);
        invoice.setAmount(amount);
        invoice.setCurrency(currency);
        invoice.setStatus(Invoice.Status.PENDING);
        Invoice savedInvoice = invoiceRepository.save(invoice);

        return FulfillResponseDTO.fromEntities(request, savedInvoice);
    }

    public ServiceRequest accept(UUID id, UUID userActorId) {
        ServiceRequest request = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest", id.toString()));
        validateProvider(request, userActorId);
        validateTransition(request, ServiceRequest.Status.ACCEPTED);
        request.setStatus(ServiceRequest.Status.ACCEPTED);
        request.setAcceptedAt(LocalDateTime.now());
        return serviceRequestRepository.save(request);
    }

    public ServiceRequest start(UUID id, UUID userActorId) {
        ServiceRequest request = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest", id.toString()));
        validateProvider(request, userActorId);
        validateTransition(request, ServiceRequest.Status.IN_PROGRESS);
        request.setStatus(ServiceRequest.Status.IN_PROGRESS);
        request.setStartedAt(LocalDateTime.now());
        return serviceRequestRepository.save(request);
    }

    public ServiceRequest cancel(UUID id, UUID userActorId) {
        ServiceRequest request = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest", id.toString()));
        validateConsumer(request, userActorId);
        validateTransition(request, ServiceRequest.Status.CANCELLED);
        request.setStatus(ServiceRequest.Status.CANCELLED);
        request.setCancelledAt(LocalDateTime.now());
        return serviceRequestRepository.save(request);
    }

    public ServiceRequest cancel(UUID id) {
        ServiceRequest request = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest", id.toString()));
        validateTransition(request, ServiceRequest.Status.CANCELLED);
        request.setStatus(ServiceRequest.Status.CANCELLED);
        return serviceRequestRepository.save(request);
    }

    public void deleteById(UUID id) {
        serviceRequestRepository.deleteById(id);
    }
}
