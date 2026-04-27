package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.*;
import com.bizcore.bizcore_backend.dto.FulfillResponseDTO;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.repository.*;
import com.bizcore.bizcore_backend.security.TenantContext;
import org.junit.jupiter.api.AfterEach;
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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServiceRequestServiceTest {

    @Mock private ServiceRequestRepository serviceRequestRepository;
    @Mock private ActorRepository actorRepository;
    @Mock private ServiceCatalogueRepository serviceCatalogueRepository;
    @Mock private InvoiceRepository invoiceRepository;

    @InjectMocks
    private ServiceRequestService serviceRequestService;

    private UUID tenantId, consumerId, providerId, catalogueId, srId;
    private Tenant tenant;
    private Actor consumer, provider;
    private ServiceCatalogue catalogue;
    private ServiceRequest pendingSr;
    private User consumerUser;

    @BeforeEach
    void setUp() {
        tenantId    = UUID.randomUUID();
        consumerId  = UUID.randomUUID();
        providerId  = UUID.randomUUID();
        catalogueId = UUID.randomUUID();
        srId        = UUID.randomUUID();

        tenant = new Tenant();
        tenant.setId(tenantId);
        tenant.setName("Pharmacie Centrale");

        consumerUser = new User();
        consumerUser.setId(UUID.randomUUID());
        consumerUser.setTenant(tenant);

        consumer = new Actor();
        consumer.setId(consumerId);
        consumer.setRole("CONSUMER");
        consumer.setUser(consumerUser);

        provider = new Actor();
        provider.setId(providerId);
        provider.setRole("PROVIDER");

        catalogue = new ServiceCatalogue();
        catalogue.setId(catalogueId);
        catalogue.setName("Dispensation médicaments ordonnance");
        catalogue.setBasePrice(new BigDecimal("15000.00"));
        catalogue.setCurrency("XAF");

        pendingSr = new ServiceRequest();
        pendingSr.setId(srId);
        pendingSr.setConsumer(consumer);
        pendingSr.setProvider(provider);
        pendingSr.setServiceCatalogue(catalogue);
        pendingSr.setStatus(ServiceRequest.Status.PENDING);
        pendingSr.setTenant(tenant);
        pendingSr.setServiceName("Dispensation Amoxicilline");
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    // ── Lecture tenant-aware ──────────────────────────────────────────────────

    @Test
    void findAll_withTenantContext_shouldUseTenantAwareQuery() {
        TenantContext.setTenantId(tenantId);
        Page<ServiceRequest> page = new PageImpl<>(List.of(pendingSr));
        when(serviceRequestRepository.findAllByTenantId(eq(tenantId), any(Pageable.class)))
                .thenReturn(page);

        Page<ServiceRequest> result = serviceRequestService.findAll(PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
        verify(serviceRequestRepository).findAllByTenantId(eq(tenantId), any(Pageable.class));
        verify(serviceRequestRepository, never()).findAll(any(Pageable.class));
    }

    @Test
    void findAll_withoutTenantContext_shouldReturnAll() {
        Page<ServiceRequest> page = new PageImpl<>(List.of(pendingSr));
        when(serviceRequestRepository.findAll(any(Pageable.class))).thenReturn(page);

        serviceRequestService.findAll(PageRequest.of(0, 10));

        verify(serviceRequestRepository).findAll(any(Pageable.class));
        verify(serviceRequestRepository, never()).findAllByTenantId(any(), any());
    }

    // ── Création ──────────────────────────────────────────────────────────────

    @Test
    void save_shouldInheritTenantFromConsumerUser() {
        when(actorRepository.findById(consumerId)).thenReturn(Optional.of(consumer));
        when(actorRepository.findById(providerId)).thenReturn(Optional.of(provider));
        when(serviceCatalogueRepository.findById(catalogueId)).thenReturn(Optional.of(catalogue));
        when(serviceRequestRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ServiceRequest request = new ServiceRequest();
        request.setServiceName("Test dispensation");
        ServiceRequest saved = serviceRequestService.save(consumerId, providerId, catalogueId, request);

        assertNotNull(saved.getTenant(), "Le tenant doit être hérité du User du consumer");
        assertEquals(tenantId, saved.getTenant().getId());
        assertEquals(ServiceRequest.Status.PENDING, saved.getStatus());
        assertNotNull(saved.getTraceId(), "traceId doit être généré");
    }

    @Test
    void save_shouldThrow_whenConsumerNotFound() {
        when(actorRepository.findById(consumerId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                serviceRequestService.save(consumerId, providerId, catalogueId, new ServiceRequest()));
    }

    @Test
    void save_shouldThrow_whenCatalogueNotFound() {
        when(actorRepository.findById(consumerId)).thenReturn(Optional.of(consumer));
        when(actorRepository.findById(providerId)).thenReturn(Optional.of(provider));
        when(serviceCatalogueRepository.findById(catalogueId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                serviceRequestService.save(consumerId, providerId, catalogueId, new ServiceRequest()));
    }

    // ── Transitions FSM ───────────────────────────────────────────────────────

    @Test
    void accept_shouldTransitionPendingToAccepted() {
        when(serviceRequestRepository.findById(srId)).thenReturn(Optional.of(pendingSr));
        when(actorRepository.findById(providerId)).thenReturn(Optional.of(provider));
        when(serviceRequestRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ServiceRequest result = serviceRequestService.accept(srId, providerId);

        assertEquals(ServiceRequest.Status.ACCEPTED, result.getStatus());
        assertNotNull(result.getAcceptedAt());
    }

    @Test
    void start_shouldTransitionAcceptedToInProgress() {
        pendingSr.setStatus(ServiceRequest.Status.ACCEPTED);
        when(serviceRequestRepository.findById(srId)).thenReturn(Optional.of(pendingSr));
        when(actorRepository.findById(providerId)).thenReturn(Optional.of(provider));
        when(serviceRequestRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ServiceRequest result = serviceRequestService.start(srId, providerId);

        assertEquals(ServiceRequest.Status.IN_PROGRESS, result.getStatus());
        assertNotNull(result.getStartedAt());
    }

    @Test
    void fulfill_shouldTransitionToFulfilledAndCreateInvoiceWithCorrectAmount() {
        pendingSr.setStatus(ServiceRequest.Status.IN_PROGRESS);
        when(serviceRequestRepository.findById(srId)).thenReturn(Optional.of(pendingSr));
        when(serviceRequestRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(invoiceRepository.save(any())).thenAnswer(inv -> {
            Invoice i = inv.getArgument(0);
            i.setId(UUID.randomUUID());
            return i;
        });

        FulfillResponseDTO result = serviceRequestService.fulfill(srId);

        assertEquals(ServiceRequest.Status.FULFILLED, result.getServiceRequest().getStatus());
        assertNotNull(result.getInvoice(), "Invoice générée automatiquement (ACK)");
        assertEquals("XAF", result.getInvoice().getCurrency());
        assertEquals(new BigDecimal("15000.00"), result.getInvoice().getAmount());
        verify(invoiceRepository).save(any(Invoice.class));
    }

    @Test
    void cancel_shouldTransitionToCancelled_fromPending() {
        when(serviceRequestRepository.findById(srId)).thenReturn(Optional.of(pendingSr));
        when(actorRepository.findById(consumerId)).thenReturn(Optional.of(consumer));
        when(serviceRequestRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ServiceRequest result = serviceRequestService.cancel(srId, consumerId);

        assertEquals(ServiceRequest.Status.CANCELLED, result.getStatus());
        assertNotNull(result.getCancelledAt());
    }

    @Test
    void transition_shouldThrow_whenAlreadyFulfilled() {
        pendingSr.setStatus(ServiceRequest.Status.FULFILLED);
        when(serviceRequestRepository.findById(srId)).thenReturn(Optional.of(pendingSr));
        when(actorRepository.findById(providerId)).thenReturn(Optional.of(provider));

        assertThrows(IllegalStateException.class,
                () -> serviceRequestService.accept(srId, providerId));
    }

    @Test
    void accept_shouldThrow_whenActorIsNotProvider() {
        UUID wrongId = UUID.randomUUID();
        Actor wrong = new Actor();
        wrong.setId(wrongId);
        when(serviceRequestRepository.findById(srId)).thenReturn(Optional.of(pendingSr));
        when(actorRepository.findById(wrongId)).thenReturn(Optional.of(wrong));

        assertThrows(IllegalArgumentException.class,
                () -> serviceRequestService.accept(srId, wrongId));
    }
}
