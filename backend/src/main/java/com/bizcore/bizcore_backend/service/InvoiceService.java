package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Invoice;
import com.bizcore.bizcore_backend.domain.ServiceRequest;
import com.bizcore.bizcore_backend.domain.SupportedCurrency;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.repository.InvoiceRepository;
import com.bizcore.bizcore_backend.repository.ServiceRequestRepository;
import com.bizcore.bizcore_backend.security.TenantContext;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ServiceRequestRepository serviceRequestRepository;

    public InvoiceService(InvoiceRepository invoiceRepository,
                          ServiceRequestRepository serviceRequestRepository) {
        this.invoiceRepository = invoiceRepository;
        this.serviceRequestRepository = serviceRequestRepository;
    }

    /**
     * Retourne les factures du tenant courant (si défini), sinon toutes.
     * Signature sans Pageable pour compatibilité InvoiceController existant.
     */
    public List<Invoice> findAll() {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId != null) {
            return invoiceRepository.findAllByTenantId(tenantId);
        }
        return invoiceRepository.findAll();
    }

    public Optional<Invoice> findById(UUID id) {
        return invoiceRepository.findById(id);
    }

    public Optional<Invoice> findByServiceRequestId(UUID serviceRequestId) {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId != null) {
            return invoiceRepository.findByServiceRequestIdAndTenantId(serviceRequestId, tenantId);
        }
        return invoiceRepository.findByServiceRequestId(serviceRequestId);
    }

    public List<Invoice> findByStatus(Invoice.Status status) {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId != null) {
            return invoiceRepository.findByStatusAndTenantId(status, tenantId);
        }
        return invoiceRepository.findByStatus(status);
    }

    public Invoice save(UUID serviceRequestId, Invoice invoice) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(serviceRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest",
                        serviceRequestId.toString()));

        if (invoice.getCurrency() != null
                && !SupportedCurrency.isSupported(invoice.getCurrency())) {
            throw new RuntimeException("Devise non supportée : " + invoice.getCurrency()
                    + ". Devises acceptées : XAF, XOF, NGN, KES, GHS, USD, EUR, GBP");
        }

        if (invoice.getCurrency() == null) {
            invoice.setCurrency("XAF");
        }

        invoice.setServiceRequest(serviceRequest);
        // issuedAt est géré automatiquement par @PrePersist sur Invoice

        return invoiceRepository.save(invoice);
    }

    public Invoice pay(UUID id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id.toString()));
        invoice.setStatus(Invoice.Status.PAID);
        invoice.setPaidAt(LocalDateTime.now());
        return invoiceRepository.save(invoice);
    }

    public Invoice cancel(UUID id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id.toString()));
        invoice.setStatus(Invoice.Status.CANCELLED);
        return invoiceRepository.save(invoice);
    }

    public void deleteById(UUID id) {
        invoiceRepository.deleteById(id);
    }
}
