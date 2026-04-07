package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Actor;
import com.bizcore.bizcore_backend.domain.Business;
import com.bizcore.bizcore_backend.domain.Invoice;
import com.bizcore.bizcore_backend.domain.ServiceCatalogue;
import com.bizcore.bizcore_backend.domain.ServiceRequest;
import com.bizcore.bizcore_backend.dto.FulfillResponseDTO;
import com.bizcore.bizcore_backend.repository.ActorRepository;
import com.bizcore.bizcore_backend.repository.InvoiceRepository;
import com.bizcore.bizcore_backend.repository.ServiceCatalogueRepository;
import com.bizcore.bizcore_backend.repository.ServiceRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ServiceRequestServiceTest {

    @Mock private ServiceRequestRepository serviceRequestRepository;
    @Mock private ActorRepository actorRepository;
    @Mock private InvoiceRepository invoiceRepository;
    @Mock private ServiceCatalogueRepository serviceCatalogueRepository;

    private ServiceRequestService service;
    private ServiceRequest serviceRequest;
    private Actor consumer;
    private Actor provider;
    private Business business;
    private ServiceCatalogue serviceCatalogue;
    private UUID requestId;
    private UUID consumerId;
    private UUID providerId;
    private UUID serviceCatalogueId;

    @BeforeEach
    void setUp() {
        service = new ServiceRequestService(
                serviceRequestRepository, actorRepository, invoiceRepository, serviceCatalogueRepository);

        requestId = UUID.randomUUID();
        consumerId = UUID.randomUUID();
        providerId = UUID.randomUUID();
        serviceCatalogueId = UUID.randomUUID();

        consumer = new Actor();
        consumer.setId(consumerId);
        consumer.setRole("Consommateur");

        provider = new Actor();
        provider.setId(providerId);
        provider.setRole("Prestataire");

        business = new Business();
        business.setId(UUID.randomUUID());
        business.setName("Pharmacien");
        business.setDomain("Santé");

        serviceCatalogue = new ServiceCatalogue();
        serviceCatalogue.setId(serviceCatalogueId);
        serviceCatalogue.setBusiness(business);
        serviceCatalogue.setName("Consultation");
        serviceCatalogue.setBasePrice(new BigDecimal("15000.00"));
        serviceCatalogue.setCurrency("XAF");

        serviceRequest = new ServiceRequest();
        serviceRequest.setId(requestId);
        serviceRequest.setConsumer(consumer);
        serviceRequest.setProvider(provider);
        serviceRequest.setServiceCatalogue(serviceCatalogue);
        serviceRequest.setServiceName("Consultation");
    }

    @Test
    void findAll_shouldReturnPageOfRequests() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<ServiceRequest> page = new PageImpl<>(Arrays.asList(serviceRequest));
        when(serviceRequestRepository.findAll(pageable)).thenReturn(page);

        Page<ServiceRequest> result = service.findAll(pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Consultation", result.getContent().get(0).getServiceName());
    }

    @Test
    void findById_shouldReturnRequest_whenExists() {
        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));

        Optional<ServiceRequest> result = service.findById(requestId);

        assertTrue(result.isPresent());
        assertEquals(ServiceRequest.Status.PENDING, result.get().getStatus());
    }

    @Test
    void save_shouldCreateRequest_withValidActorsAndCatalogue() {
        ServiceRequest newRequest = new ServiceRequest();

        when(actorRepository.findById(consumerId)).thenReturn(Optional.of(consumer));
        when(actorRepository.findById(providerId)).thenReturn(Optional.of(provider));
        when(serviceCatalogueRepository.findById(serviceCatalogueId)).thenReturn(Optional.of(serviceCatalogue));
        when(serviceRequestRepository.save(any(ServiceRequest.class))).thenAnswer(i -> {
            ServiceRequest sr = i.getArgument(0);
            sr.setId(requestId);
            return sr;
        });

        ServiceRequest result = service.save(consumerId, providerId, serviceCatalogueId, newRequest);

        assertNotNull(result);
        assertNotNull(result.getId());
    }

    @Test
    void save_shouldThrowException_whenConsumerAndProviderAreSame() {
        ServiceRequest newRequest = new ServiceRequest();

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> service.save(consumerId, consumerId, serviceCatalogueId, newRequest));

        assertEquals("Un utilisateur ne peut pas être à la fois le consommateur et le fournisseur du même service.",
                exception.getMessage());
    }

    @Test
    void save_shouldThrowException_whenConsumerNotFound() {
        when(actorRepository.findById(consumerId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> service.save(consumerId, providerId, serviceCatalogueId, new ServiceRequest()));
    }

    @Test
    void fulfill_shouldCreateInvoiceWithCorrectAmount() {
        serviceRequest.setStatus(ServiceRequest.Status.IN_PROGRESS);

        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));
        when(invoiceRepository.findByServiceRequestId(requestId)).thenReturn(Optional.empty());
        when(serviceRequestRepository.save(any(ServiceRequest.class))).thenAnswer(i -> i.getArgument(0));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(i -> i.getArgument(0));

        FulfillResponseDTO result = service.fulfill(requestId);

        assertNotNull(result);
        assertNotNull(result.getInvoice());
        assertEquals(new BigDecimal("15000.00"), result.getInvoice().getAmount());
        assertEquals("XAF", result.getInvoice().getCurrency());
    }

    @Test
    void fulfill_shouldThrowException_whenNotInProgress() {
        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));
        when(invoiceRepository.findByServiceRequestId(requestId)).thenReturn(Optional.empty());

        assertThrows(IllegalStateException.class, () -> service.fulfill(requestId));
    }

    @Test
    void fulfill_shouldThrowException_whenInvoiceAlreadyExists() {
        Invoice existingInvoice = new Invoice();
        existingInvoice.setId(UUID.randomUUID());

        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));
        when(invoiceRepository.findByServiceRequestId(requestId)).thenReturn(Optional.of(existingInvoice));

        assertThrows(IllegalStateException.class, () -> service.fulfill(requestId));
    }

    @Test
    void fulfill_shouldThrowException_whenBasePriceIsNull() {
        serviceCatalogue.setBasePrice(null);

        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));
        when(invoiceRepository.findByServiceRequestId(requestId)).thenReturn(Optional.empty());

        assertThrows(IllegalStateException.class, () -> service.fulfill(requestId));
    }

    @Test
    void fulfill_shouldThrowException_whenBasePriceIsZero() {
        serviceCatalogue.setBasePrice(BigDecimal.ZERO);

        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));
        when(invoiceRepository.findByServiceRequestId(requestId)).thenReturn(Optional.empty());

        assertThrows(IllegalStateException.class, () -> service.fulfill(requestId));
    }

    @Test
    void fulfill_shouldUseDefaultCurrency_whenCatalogueCurrencyIsNull() {
        serviceRequest.setStatus(ServiceRequest.Status.IN_PROGRESS);
        serviceCatalogue.setCurrency(null);

        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));
        when(invoiceRepository.findByServiceRequestId(requestId)).thenReturn(Optional.empty());
        when(serviceRequestRepository.save(any(ServiceRequest.class))).thenAnswer(i -> i.getArgument(0));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(i -> i.getArgument(0));

        FulfillResponseDTO result = service.fulfill(requestId);

        assertEquals("XAF", result.getInvoice().getCurrency());
    }

    @Test
    void cancel_shouldUpdateStatusToCancelled() {
        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));
        when(serviceRequestRepository.save(any(ServiceRequest.class))).thenAnswer(i -> i.getArgument(0));

        ServiceRequest result = service.cancel(requestId);

        assertEquals(ServiceRequest.Status.CANCELLED, result.getStatus());
    }

    @Test
    void accept_shouldUpdateStatusToAccepted() {
        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));
        when(serviceRequestRepository.save(any(ServiceRequest.class))).thenAnswer(i -> i.getArgument(0));

        ServiceRequest result = service.accept(requestId, providerId);

        assertEquals(ServiceRequest.Status.ACCEPTED, result.getStatus());
        assertNotNull(result.getAcceptedAt());
    }

    @Test
    void accept_shouldThrowException_whenNotProvider() {
        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));

        assertThrows(org.springframework.security.access.AccessDeniedException.class,
                () -> service.accept(requestId, consumerId));
    }

    @Test
    void start_shouldUpdateStatusToInProgress() {
        serviceRequest.setStatus(ServiceRequest.Status.ACCEPTED);

        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));
        when(serviceRequestRepository.save(any(ServiceRequest.class))).thenAnswer(i -> i.getArgument(0));

        ServiceRequest result = service.start(requestId, providerId);

        assertEquals(ServiceRequest.Status.IN_PROGRESS, result.getStatus());
    }

    @Test
    void fulfill_shouldThrowException_whenRequestNotFound() {
        when(serviceRequestRepository.findById(any(UUID.class))).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.fulfill(UUID.randomUUID()));
    }
}
