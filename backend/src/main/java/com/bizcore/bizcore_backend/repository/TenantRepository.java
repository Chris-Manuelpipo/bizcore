package com.bizcore.bizcore_backend.repository;

import com.bizcore.bizcore_backend.domain.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, UUID> {
    Optional<Tenant> findByName(String name);
    List<Tenant> findByDomain(String domain);
    List<Tenant> findByIsActiveTrue();
    boolean existsByName(String name);
}