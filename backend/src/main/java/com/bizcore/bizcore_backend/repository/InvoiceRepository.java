package com.bizcore.bizcore_backend.repository;

import com.bizcore.bizcore_backend.domain.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    // ── Tenant-aware via ServiceRequest (Invoice n'a pas de tenant_id direct) ─
    // On remonte la chaîne : Invoice → ServiceRequest → Tenant
    @Query("SELECT i FROM Invoice i WHERE i.serviceRequest.tenant.id = :tenantId")
    List<Invoice> findAllByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT i FROM Invoice i WHERE i.serviceRequest.tenant.id = :tenantId AND i.status = :status")
    List<Invoice> findByStatusAndTenantId(@Param("status") Invoice.Status status,
                                           @Param("tenantId") UUID tenantId);

    @Query("SELECT i FROM Invoice i WHERE i.serviceRequest.id = :serviceRequestId AND i.serviceRequest.tenant.id = :tenantId")
    Optional<Invoice> findByServiceRequestIdAndTenantId(@Param("serviceRequestId") UUID serviceRequestId,
                                                         @Param("tenantId") UUID tenantId);

    // ── Sans filtre tenant ────────────────────────────────────────────────────
    Optional<Invoice> findByServiceRequestId(UUID serviceRequestId);
    List<Invoice> findByStatus(Invoice.Status status);
}
