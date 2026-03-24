package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Actor;
import com.bizcore.bizcore_backend.domain.Business;
import com.bizcore.bizcore_backend.domain.Invoice;
import com.bizcore.bizcore_backend.domain.ServiceCatalogue;
import com.bizcore.bizcore_backend.domain.ServiceRequest;
import com.bizcore.bizcore_backend.dto.FulfillResponseDTO;
import com.bizcore.bizcore_backend.repository.ActorRepository;
import com.bizcore.bizcore_backend.repository.BusinessRepository;
import com.bizcore.bizcore_backend.repository.InvoiceRepository;
import com.bizcore.bizcore_backend.repository.ServiceCatalogueRepository;
import com.bizcore.bizcore_backend.repository.ServiceRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServiceRequestServiceTest {

    @Mock
    private ServiceRequestRepository serviceRequestRepository;

    @Mock
    private ActorRepository actorRepository;

    @Mock
    private BusinessRepository businessRepository;

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private ServiceCatalogueRepository serviceCatalogueRepository;

    @InjectMocks
    private ServiceRequestService serviceRequestService;

    private ServiceRequest serviceRequest;
    private Actor consumer;
    private Actor provider;
    private Business business;
    private ServiceCatalogue serviceCatalogue;
    private UUID requestId;
    private UUID consumerId;
    private UUID providerId;
    private UUID businessId;

    @BeforeEach
    void setUp() {
        requestId = UUID.randomUUID();
        consumerId = UUID.randomUUID();
        providerId = UUID.randomUUID();
        businessId = UUID.randomUUID();

        consumer = new Actor();
        consumer.setId(consumerId);
        consumer.setRole("Consommateur de Service");

        provider = new Actor();
        provider.setId(providerId);
        provider.setRole("Fournisseur de Service");

        business = new Business();
        business.setId(businessId);
        business.setName("Pharmacien");
        business.setDomain("Santé");

        serviceCatalogue = new ServiceCatalogue();
        serviceCatalogue.setId(UUID.randomUUID());
        serviceCatalogue.setBusiness(business);
        serviceCatalogue.setName("Consultation");
        serviceCatalogue.setBasePrice(new BigDecimal("15000.00"));
        serviceCatalogue.setCurrency("XAF");

        serviceRequest = new ServiceRequest();
        serviceRequest.setId(requestId);
        serviceRequest.setConsumer(consumer);
        serviceRequest.setProvider(provider);
        serviceRequest.setBusiness(business);
        serviceRequest.setServiceName("Consultation");
        serviceRequest.setStatus(ServiceRequest.Status.PENDING);
    }

    @Test
    void findAll_shouldReturnPageOfRequests() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<ServiceRequest> page = new PageImpl<>(Arrays.asList(serviceRequest));
        when(serviceRequestRepository.findAll(pageable)).thenReturn(page);

        Page<ServiceRequest> result = serviceRequestService.findAll(pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Consultation", result.getContent().get(0).getServiceName());
    }

    @Test
    void findById_shouldReturnRequest_whenExists() {
        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));

        Optional<ServiceRequest> result = serviceRequestService.findById(requestId);

        assertTrue(result.isPresent());
        assertEquals(ServiceRequest.Status.PENDING, result.get().getStatus());
    }

    @Test
    void save_shouldCreateRequest_withValidActorsAndBusiness() {
        ServiceRequest newRequest = new ServiceRequest();
        newRequest.setServiceName("Consultation");

        when(actorRepository.findById(consumerId)).thenReturn(Optional.of(consumer));
        when(actorRepository.findById(providerId)).thenReturn(Optional.of(provider));
        when(businessRepository.findById(businessId)).thenReturn(Optional.of(business));
        when(serviceRequestRepository.save(any(ServiceRequest.class))).thenReturn(serviceRequest);

        ServiceRequest result = serviceRequestService.save(consumerId, providerId, businessId, newRequest);

        assertNotNull(result);
        assertEquals("Consultation", result.getServiceName());
        assertEquals(ServiceRequest.Status.PENDING, result.getStatus());
    }

    @Test
    void save_shouldThrowException_whenConsumerAndProviderAreSame() {
        ServiceRequest newRequest = new ServiceRequest();
        newRequest.setServiceName("Consultation");

        // Use same ID for both consumer and provider
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> serviceRequestService.save(consumerId, consumerId, businessId, newRequest));

        assertEquals("Un utilisateur ne peut pas être à la fois le consommateur et le fournisseur du même service.",
                exception.getMessage());
    }

    @Test
    void save_shouldThrowException_whenConsumerNotFound() {
        when(actorRepository.findById(consumerId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> serviceRequestService.save(consumerId, providerId, businessId, serviceRequest));
    }

    @Test
    void fulfill_shouldCreateInvoiceWithCorrectAmount() {
        // Set to IN_PROGRESS first (only IN_PROGRESS can transition to FULFILLED)
        serviceRequest.setStatus(ServiceRequest.Status.IN_PROGRESS);
        
        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));
        when(invoiceRepository.findByServiceRequestId(requestId)).thenReturn(Optional.empty());
        when(serviceCatalogueRepository.findFirstByBusinessIdAndName(businessId, "Consultation"))
                .thenReturn(Optional.of(serviceCatalogue));
        when(serviceRequestRepository.save(any(ServiceRequest.class))).thenAnswer(i -> i.getArgument(0));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(i -> i.getArgument(0));

        FulfillResponseDTO result = serviceRequestService.fulfill(requestId);

        assertNotNull(result);
        assertNotNull(result.getServiceRequest());
        assertNotNull(result.getInvoice());
        assertEquals(ServiceRequest.Status.FULFILLED, result.getServiceRequest().getStatus());
        assertNotNull(result.getServiceRequest().getFulfilledAt());
        assertEquals(new BigDecimal("15000.00"), result.getInvoice().getAmount());
        assertEquals("XAF", result.getInvoice().getCurrency());
        assertEquals(Invoice.Status.PENDING, result.getInvoice().getStatus());
    }

    @Test
    void fulfill_shouldThrowException_whenNotInProgress() {
        // Try to fulfill from PENDING (invalid transition)
        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));

        assertThrows(IllegalStateException.class,
                () -> serviceRequestService.fulfill(requestId));
    }

    @Test
    void fulfill_shouldThrowException_whenInvoiceAlreadyExists() {
        serviceRequest.setStatus(ServiceRequest.Status.IN_PROGRESS);
        Invoice existingInvoice = new Invoice();
        existingInvoice.setId(UUID.randomUUID());
        
        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));
        when(invoiceRepository.findByServiceRequestId(requestId)).thenReturn(Optional.of(existingInvoice));

        assertThrows(IllegalStateException.class,
                () -> serviceRequestService.fulfill(requestId));
    }

    @Test
    void fulfill_shouldThrowException_whenServiceCatalogueNotFound() {
        serviceRequest.setStatus(ServiceRequest.Status.IN_PROGRESS);
        
        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));
        when(invoiceRepository.findByServiceRequestId(requestId)).thenReturn(Optional.empty());
        when(serviceCatalogueRepository.findFirstByBusinessIdAndName(businessId, "Consultation"))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> serviceRequestService.fulfill(requestId));
    }

    @Test
    void fulfill_shouldThrowException_whenBasePriceIsNull() {
        serviceRequest.setStatus(ServiceRequest.Status.IN_PROGRESS);
        serviceCatalogue.setBasePrice(null);
        
        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));
        when(invoiceRepository.findByServiceRequestId(requestId)).thenReturn(Optional.empty());
        when(serviceCatalogueRepository.findFirstByBusinessIdAndName(businessId, "Consultation"))
                .thenReturn(Optional.of(serviceCatalogue));

        assertThrows(IllegalStateException.class,
                () -> serviceRequestService.fulfill(requestId));
    }

    @Test
    void fulfill_shouldThrowException_whenBasePriceIsZero() {
        serviceRequest.setStatus(ServiceRequest.Status.IN_PROGRESS);
        serviceCatalogue.setBasePrice(BigDecimal.ZERO);
        
        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));
        when(invoiceRepository.findByServiceRequestId(requestId)).thenReturn(Optional.empty());
        when(serviceCatalogueRepository.findFirstByBusinessIdAndName(businessId, "Consultation"))
                .thenReturn(Optional.of(serviceCatalogue));

        assertThrows(IllegalStateException.class,
                () -> serviceRequestService.fulfill(requestId));
    }

    @Test
    void fulfill_shouldUseDefaultCurrency_whenCatalogueCurrencyIsNull() {
        serviceRequest.setStatus(ServiceRequest.Status.IN_PROGRESS);
        serviceCatalogue.setCurrency(null);
        
        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));
        when(invoiceRepository.findByServiceRequestId(requestId)).thenReturn(Optional.empty());
        when(serviceCatalogueRepository.findFirstByBusinessIdAndName(businessId, "Consultation"))
                .thenReturn(Optional.of(serviceCatalogue));
        when(serviceRequestRepository.save(any(ServiceRequest.class))).thenAnswer(i -> i.getArgument(0));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(i -> i.getArgument(0));

        FulfillResponseDTO result = serviceRequestService.fulfill(requestId);

        assertEquals("XAF", result.getInvoice().getCurrency());
    }

    @Test
    void cancel_shouldUpdateStatusToCancelled() {
        // Set to IN_PROGRESS first (only IN_PROGRESS can transition to CANCELLED)
        serviceRequest.setStatus(ServiceRequest.Status.IN_PROGRESS);
        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));
        when(serviceRequestRepository.save(any(ServiceRequest.class))).thenAnswer(i -> i.getArgument(0));

        ServiceRequest result = serviceRequestService.cancel(requestId);

        assertEquals(ServiceRequest.Status.CANCELLED, result.getStatus());
    }

    @Test
    void accept_shouldUpdateStatusToAccepted() {
        // PENDING → ACCEPTED (only provider can accept)
        serviceRequest.setStatus(ServiceRequest.Status.PENDING);
        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));
        when(serviceRequestRepository.save(any(ServiceRequest.class))).thenAnswer(i -> i.getArgument(0));

        ServiceRequest result = serviceRequestService.accept(requestId, providerId);

        assertEquals(ServiceRequest.Status.ACCEPTED, result.getStatus());
    }

    @Test
    void accept_shouldThrowException_whenNotProvider() {
        // Only the provider can accept
        serviceRequest.setStatus(ServiceRequest.Status.PENDING);
        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));

        assertThrows(org.springframework.security.access.AccessDeniedException.class,
                () -> serviceRequestService.accept(requestId, consumerId));
    }

    @Test
    void accept_shouldThrowException_whenNotPending() {
        // Can only accept from PENDING state
        serviceRequest.setStatus(ServiceRequest.Status.ACCEPTED);
        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));

        assertThrows(IllegalStateException.class,
                () -> serviceRequestService.accept(requestId, providerId));
    }

    @Test
    void start_shouldUpdateStatusToInProgress() {
        // ACCEPTED → IN_PROGRESS (only provider can start)
        serviceRequest.setStatus(ServiceRequest.Status.ACCEPTED);
        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));
        when(serviceRequestRepository.save(any(ServiceRequest.class))).thenAnswer(i -> i.getArgument(0));

        ServiceRequest result = serviceRequestService.start(requestId, providerId);

        assertEquals(ServiceRequest.Status.IN_PROGRESS, result.getStatus());
    }

    @Test
    void start_shouldThrowException_whenNotProvider() {
        // Only the provider can start work
        serviceRequest.setStatus(ServiceRequest.Status.ACCEPTED);
        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));

        assertThrows(org.springframework.security.access.AccessDeniedException.class,
                () -> serviceRequestService.start(requestId, consumerId));
    }

    @Test
    void start_shouldThrowException_whenNotAccepted() {
        // Can only start from ACCEPTED state
        serviceRequest.setStatus(ServiceRequest.Status.PENDING);
        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));

        assertThrows(IllegalStateException.class,
                () -> serviceRequestService.start(requestId, providerId));
    }

    @Test
    void cancel_withActorId_shouldUpdateStatusToCancelled() {
        // IN_PROGRESS → CANCELLED (only consumer can cancel)
        serviceRequest.setStatus(ServiceRequest.Status.IN_PROGRESS);
        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));
        when(serviceRequestRepository.save(any(ServiceRequest.class))).thenAnswer(i -> i.getArgument(0));

        ServiceRequest result = serviceRequestService.cancel(requestId, consumerId);

        assertEquals(ServiceRequest.Status.CANCELLED, result.getStatus());
    }

    @Test
    void cancel_withActorId_shouldThrowException_whenNotConsumer() {
        // Only the consumer can cancel
        serviceRequest.setStatus(ServiceRequest.Status.IN_PROGRESS);
        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));

        assertThrows(org.springframework.security.access.AccessDeniedException.class,
                () -> serviceRequestService.cancel(requestId, providerId));
    }

    @Test
    void fulfill_shouldThrowException_whenRequestNotFound() {
        when(serviceRequestRepository.findById(any(UUID.class))).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,  
                () -> serviceRequestService.fulfill(UUID.randomUUID()));
    }
}
