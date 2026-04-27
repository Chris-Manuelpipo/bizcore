package com.bizcore.bizcore_backend.repository;

import com.bizcore.bizcore_backend.domain.Actor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ActorRepository extends JpaRepository<Actor, UUID> {

    // ── Tenant-aware via User (Actor n'a pas de tenant_id direct) ────────────
    // Spring Data traduit "UserTenantId" → JOIN actors a JOIN users u ON a.user_id = u.id WHERE u.tenant_id = ?
    Page<Actor> findAllByUserTenantId(UUID tenantId, Pageable pageable);
    List<Actor> findByRoleAndUserTenantId(String role, UUID tenantId);

    // ── Sans filtre tenant ────────────────────────────────────────────────────
    List<Actor> findByUserId(UUID userId);
    List<Actor> findByRole(String role);
    List<Actor> findByIsActive(Boolean isActive);
}
