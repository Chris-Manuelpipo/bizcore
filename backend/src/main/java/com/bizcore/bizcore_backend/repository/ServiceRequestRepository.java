package com.bizcore.bizcore_backend.repository;

import com.bizcore.bizcore_backend.domain.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, UUID> {
    List<ServiceRequest> findByConsumerId(UUID consumerId);
    List<ServiceRequest> findByProviderId(UUID providerId);
    List<ServiceRequest> findByStatus(ServiceRequest.Status status);
    List<ServiceRequest> findByBusinessId(UUID businessId);
}