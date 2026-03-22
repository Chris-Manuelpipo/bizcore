package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Actor;
import com.bizcore.bizcore_backend.domain.Business;
import com.bizcore.bizcore_backend.domain.ServiceRequest;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.repository.ActorRepository;
import com.bizcore.bizcore_backend.repository.BusinessRepository;
import com.bizcore.bizcore_backend.repository.ServiceRequestRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepository;
    private final ActorRepository actorRepository;
    private final BusinessRepository businessRepository;

    public ServiceRequestService(ServiceRequestRepository serviceRequestRepository,
                                 ActorRepository actorRepository,
                                 BusinessRepository businessRepository) {
        this.serviceRequestRepository = serviceRequestRepository;
        this.actorRepository = actorRepository;
        this.businessRepository = businessRepository;
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

    public ServiceRequest fulfill(UUID id) {
        ServiceRequest request = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest", id.toString()));
        request.setStatus(ServiceRequest.Status.FULFILLED);
        request.setFulfilledAt(LocalDateTime.now());
        return serviceRequestRepository.save(request);
    }

    public ServiceRequest cancel(UUID id) {
        ServiceRequest request = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest", id.toString()));
        request.setStatus(ServiceRequest.Status.CANCELLED);
        return serviceRequestRepository.save(request);
    }

    public void deleteById(UUID id) {
        serviceRequestRepository.deleteById(id);
    }
}