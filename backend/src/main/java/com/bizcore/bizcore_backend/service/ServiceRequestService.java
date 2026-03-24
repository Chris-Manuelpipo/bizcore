package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Actor;
import com.bizcore.bizcore_backend.domain.Business;
import com.bizcore.bizcore_backend.domain.Invoice;
import com.bizcore.bizcore_backend.domain.ServiceCatalogue;
import com.bizcore.bizcore_backend.domain.ServiceRequest;
import com.bizcore.bizcore_backend.dto.FulfillResponseDTO;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.repository.ActorRepository;
import com.bizcore.bizcore_backend.repository.BusinessRepository;
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
    private final BusinessRepository businessRepository;
    private final InvoiceRepository invoiceRepository;
    private final ServiceCatalogueRepository serviceCatalogueRepository;

    /**
     * State Machine transitions for ServiceRequest lifecycle.
     * Valid transitions:
     * - PENDING → ACCEPTED (by provider only)
     * - PENDING → CANCELLED (by consumer only)
     * - ACCEPTED → IN_PROGRESS (by provider only)
     * - ACCEPTED → CANCELLED (by consumer only)
     * - IN_PROGRESS → FULFILLED (by provider only)
     * - IN_PROGRESS → CANCELLED (by consumer only)
     */
    private static final Map<ServiceRequest.Status, List<ServiceRequest.Status>> VALID_TRANSITIONS;

    static {
        VALID_TRANSITIONS = new HashMap<>();
        VALID_TRANSITIONS.put(ServiceRequest.Status.PENDING,
            List.of(ServiceRequest.Status.ACCEPTED, ServiceRequest.Status.CANCELLED));
        VALID_TRANSITIONS.put(ServiceRequest.Status.ACCEPTED,
            List.of(ServiceRequest.Status.IN_PROGRESS, ServiceRequest.Status.CANCELLED));
        VALID_TRANSITIONS.put(ServiceRequest.Status.IN_PROGRESS,
            List.of(ServiceRequest.Status.FULFILLED, ServiceRequest.Status.CANCELLED));
        // Terminal states: FULFILLED and CANCELLED have no outgoing transitions
        VALID_TRANSITIONS.put(ServiceRequest.Status.FULFILLED, List.of());
        VALID_TRANSITIONS.put(ServiceRequest.Status.CANCELLED, List.of());
    }

    public ServiceRequestService(ServiceRequestRepository serviceRequestRepository,
                                 ActorRepository actorRepository,
                                 BusinessRepository businessRepository,
                                 InvoiceRepository invoiceRepository,
                                 ServiceCatalogueRepository serviceCatalogueRepository) {
        this.serviceRequestRepository = serviceRequestRepository;
        this.actorRepository = actorRepository;
        this.businessRepository = businessRepository;
        this.invoiceRepository = invoiceRepository;
        this.serviceCatalogueRepository = serviceCatalogueRepository;
    }

    /**
     * Validates if a state transition is allowed.
     */
    private void validateTransition(ServiceRequest request, ServiceRequest.Status newStatus) {
        ServiceRequest.Status currentStatus = request.getStatus();
        List<ServiceRequest.Status> allowedTransitions = VALID_TRANSITIONS.get(currentStatus);

        if (allowedTransitions == null || !allowedTransitions.contains(newStatus)) {
            throw new IllegalStateException(
                String.format("Invalid state transition: cannot transition from %s to %s. " +
                    "Allowed transitions from %s: %s",
                    currentStatus, newStatus, currentStatus, allowedTransitions)
            );
        }
    }

    /**
     * Validates that the user is the provider of the service request.
     */
    private void validateProvider(ServiceRequest request, UUID userActorId) {
        if (request.getProvider() == null || !request.getProvider().getId().equals(userActorId)) {
            throw new AccessDeniedException(
                "Only the provider can perform this action on the service request."
            );
        }
    }

    /**
     * Validates that the user is the consumer of the service request.
     */
    private void validateConsumer(ServiceRequest request, UUID userActorId) {
        if (request.getConsumer() == null || !request.getConsumer().getId().equals(userActorId)) {
            throw new AccessDeniedException(
                "Only the consumer can perform this action on the service request."
            );
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
                               UUID businessId, ServiceRequest request) {
        // Business validation: Consumer cannot be the same as Provider
        if (consumerId.equals(providerId)) {
            throw new IllegalArgumentException(
                "Un utilisateur ne peut pas être à la fois le consommateur et le fournisseur du même service.");
        }

        Actor consumer = actorRepository.findById(consumerId)
                .orElseThrow(() -> new ResourceNotFoundException("Actor (consumer)", consumerId.toString()));
        Actor provider = actorRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Actor (provider)", providerId.toString()));
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", businessId.toString()));

        request.setConsumer(consumer);
        request.setProvider(provider);
        request.setBusiness(business);
        return serviceRequestRepository.save(request);
    }

    /**
     * Mark a service request as fulfilled (IN_PROGRESS → FULFILLED).
     * Automatically creates an Invoice for the fulfilled service.
     * 
     * The invoice amount is determined by the ServiceCatalogue.basePrice of the associated service.
     * If no ServiceCatalogue is found for the service, an error is thrown.
     * If the basePrice is null or zero/negative, an error is thrown.
     * 
     * The operation is transactional - if invoice creation fails, the status change is rolled back.
     *
     * @param id The service request ID
     * @return A response containing both the updated service request and the created invoice
     * @throws ResourceNotFoundException if the service request is not found or no matching ServiceCatalogue exists
     * @throws IllegalStateException if the request is not in IN_PROGRESS state or invoice already exists
     */
    @Transactional
    public FulfillResponseDTO fulfill(UUID id) {
        // 1. Find and validate the service request
        ServiceRequest request = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest", id.toString()));
        validateTransition(request, ServiceRequest.Status.FULFILLED);
        
        // 2. Check if an invoice already exists for this service request
        if (invoiceRepository.findByServiceRequestId(id).isPresent()) {
            throw new IllegalStateException(
                "An invoice already exists for this service request. Cannot fulfill twice.");
        }
        
        // 3. Find the associated ServiceCatalogue by business and service name
        ServiceCatalogue catalogue = serviceCatalogueRepository
                .findFirstByBusinessIdAndName(request.getBusiness().getId(), request.getServiceName())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "ServiceCatalogue", 
                    String.format("Service '%s' not found in business '%s'", 
                        request.getServiceName(), request.getBusiness().getId())));
        
        // 4. Validate and extract the amount
        BigDecimal amount = catalogue.getBasePrice();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException(
                String.format("Invalid invoice amount for service '%s': %s. Amount must be greater than 0.",
                    request.getServiceName(), amount));
        }
        
        // 5. Determine currency (use catalogue currency or default to XAF)
        String currency = catalogue.getCurrency();
        if (currency == null || currency.isBlank()) {
            currency = DEFAULT_CURRENCY;
        }
        
        // 6. Update the service request status
        request.setStatus(ServiceRequest.Status.FULFILLED);
        request.setFulfilledAt(LocalDateTime.now());
        serviceRequestRepository.save(request);
        
        // 7. Create the invoice
        Invoice invoice = new Invoice();
        invoice.setServiceRequest(request);
        invoice.setAmount(amount);
        invoice.setCurrency(currency);
        invoice.setStatus(Invoice.Status.PENDING);
        Invoice savedInvoice = invoiceRepository.save(invoice);
        
        return FulfillResponseDTO.fromEntities(request, savedInvoice);
    }

    /**
     * Accept a service request (PENDING → ACCEPTED).
     * Only the provider can accept a request.
     *
     * @param id The service request ID
     * @param userActorId The actor ID of the user attempting to accept
     * @return The updated service request
     * @throws ResourceNotFoundException if the request is not found
     * @throws IllegalStateException if the request is not in PENDING state
     * @throws AccessDeniedException if the user is not the provider
     */
    public ServiceRequest accept(UUID id, UUID userActorId) {
        ServiceRequest request = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest", id.toString()));
        validateProvider(request, userActorId);
        validateTransition(request, ServiceRequest.Status.ACCEPTED);
        request.setStatus(ServiceRequest.Status.ACCEPTED);
        return serviceRequestRepository.save(request);
    }

    /**
     * Start work on a service request (ACCEPTED → IN_PROGRESS).
     * Only the provider can start work on a request.
     *
     * @param id The service request ID
     * @param userActorId The actor ID of the user attempting to start
     * @return The updated service request
     * @throws ResourceNotFoundException if the request is not found
     * @throws IllegalStateException if the request is not in ACCEPTED state
     * @throws AccessDeniedException if the user is not the provider
     */
    public ServiceRequest start(UUID id, UUID userActorId) {
        ServiceRequest request = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest", id.toString()));
        validateProvider(request, userActorId);
        validateTransition(request, ServiceRequest.Status.IN_PROGRESS);
        request.setStatus(ServiceRequest.Status.IN_PROGRESS);
        return serviceRequestRepository.save(request);
    }

    /**
     * Cancel a service request.
     * Only the consumer can cancel a request (before it reaches FULFILLED).
     *
     * @param id The service request ID
     * @param userActorId The actor ID of the user attempting to cancel
     * @return The updated service request
     * @throws ResourceNotFoundException if the request is not found
     * @throws IllegalStateException if the request cannot be cancelled from current state
     * @throws AccessDeniedException if the user is not the consumer
     */
    public ServiceRequest cancel(UUID id, UUID userActorId) {
        ServiceRequest request = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest", id.toString()));
        validateConsumer(request, userActorId);
        validateTransition(request, ServiceRequest.Status.CANCELLED);
        request.setStatus(ServiceRequest.Status.CANCELLED);
        return serviceRequestRepository.save(request);
    }

    /**
     * Cancel a service request (overload without actor validation for internal use).
     */
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