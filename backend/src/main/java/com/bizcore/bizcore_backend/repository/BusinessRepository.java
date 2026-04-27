package com.bizcore.bizcore_backend.repository;

import com.bizcore.bizcore_backend.domain.Business;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BusinessRepository extends JpaRepository<Business, UUID> {

    // ── Tenant-aware ──────────────────────────────────────────────────────────
    Page<Business> findAllByTenantId(UUID tenantId, Pageable pageable);
    List<Business> findByDomainAndTenantId(String domain, UUID tenantId);
    List<Business> findByNameContainingIgnoreCaseAndTenantId(String name, UUID tenantId);

    // ── Sans filtre (admin / usage interne) ───────────────────────────────────
    List<Business> findByDomain(String domain);
    List<Business> findByNameContainingIgnoreCase(String name);
}