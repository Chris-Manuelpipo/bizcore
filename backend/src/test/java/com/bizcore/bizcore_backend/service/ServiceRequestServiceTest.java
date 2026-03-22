package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Actor;
import com.bizcore.bizcore_backend.domain.Business;
import com.bizcore.bizcore_backend.domain.ServiceRequest;
import com.bizcore.bizcore_backend.repository.ActorRepository;
import com.bizcore.bizcore_backend.repository.BusinessRepository;
import com.bizcore.bizcore_backend.repository.ServiceRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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

    @InjectMocks
    private ServiceRequestService serviceRequestService;

    private ServiceRequest serviceRequest;
    private Actor consumer;
    private Actor provider;
    private Business business;
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

        serviceRequest = new ServiceRequest();
        serviceRequest.setId(requestId);
        serviceRequest.setConsumer(consumer);
        serviceRequest.setProvider(provider);
        serviceRequest.setBusiness(business);
        serviceRequest.setServiceName("Consultation");
        serviceRequest.setStatus(ServiceRequest.Status.PENDING);
    }

    @Test
    void findAll_shouldReturnAllRequests() {
        when(serviceRequestRepository.findAll()).thenReturn(Arrays.asList(serviceRequest));

        List<ServiceRequest> result = serviceRequestService.findAll();

        assertEquals(1, result.size());
        assertEquals("Consultation", result.get(0).getServiceName());
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
    void save_shouldThrowException_whenConsumerNotFound() {
        when(actorRepository.findById(consumerId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> serviceRequestService.save(consumerId, providerId, businessId, serviceRequest));
    }

    @Test
    void fulfill_shouldUpdateStatusToFulfilled() {
        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));
        when(serviceRequestRepository.save(any(ServiceRequest.class))).thenAnswer(i -> i.getArgument(0));

        ServiceRequest result = serviceRequestService.fulfill(requestId);

        assertEquals(ServiceRequest.Status.FULFILLED, result.getStatus());
        assertNotNull(result.getFulfilledAt());
    }

    @Test
    void cancel_shouldUpdateStatusToCancelled() {
        when(serviceRequestRepository.findById(requestId)).thenReturn(Optional.of(serviceRequest));
        when(serviceRequestRepository.save(any(ServiceRequest.class))).thenAnswer(i -> i.getArgument(0));

        ServiceRequest result = serviceRequestService.cancel(requestId);

        assertEquals(ServiceRequest.Status.CANCELLED, result.getStatus());
    }

    @Test
    void fulfill_shouldThrowException_whenRequestNotFound() {
        when(serviceRequestRepository.findById(any(UUID.class))).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> serviceRequestService.fulfill(UUID.randomUUID()));
    }
}