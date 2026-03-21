package com.bizcore.bizcore_backend.repository;

import com.bizcore.bizcore_backend.domain.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    Optional<Invoice> findByServiceRequestId(UUID serviceRequestId);
    List<Invoice> findByStatus(Invoice.Status status);
}