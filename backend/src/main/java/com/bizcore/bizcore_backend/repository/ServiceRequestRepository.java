package com.bizcore.bizcore_backend.repository;

import com.bizcore.bizcore_backend.domain.ServiceRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, UUID> {

    // ── Requêtes tenant-aware (isolation VLAN) ────────────────────────────────
    Page<ServiceRequest> findAllByTenantId(UUID tenantId, Pageable pageable);
    List<ServiceRequest> findByConsumerIdAndTenantId(UUID consumerId, UUID tenantId);
    List<ServiceRequest> findByProviderIdAndTenantId(UUID providerId, UUID tenantId);
    List<ServiceRequest> findByStatusAndTenantId(ServiceRequest.Status status, UUID tenantId);

    // ── Requêtes sans filtre tenant (usage interne / admin) ───────────────────
    List<ServiceRequest> findByConsumerId(UUID consumerId);
    List<ServiceRequest> findByProviderId(UUID providerId);
    List<ServiceRequest> findByStatus(ServiceRequest.Status status);
}