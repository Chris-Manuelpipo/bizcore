package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Invoice;
import com.bizcore.bizcore_backend.domain.ServiceRequest;
import com.bizcore.bizcore_backend.repository.InvoiceRepository;
import com.bizcore.bizcore_backend.repository.ServiceRequestRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AnalyticsService {

    private final ServiceRequestRepository serviceRequestRepository;
    private final InvoiceRepository invoiceRepository;

    public AnalyticsService(ServiceRequestRepository serviceRequestRepository, InvoiceRepository invoiceRepository) {
        this.serviceRequestRepository = serviceRequestRepository;
        this.invoiceRepository = invoiceRepository;
    }

    public static class KPIs {
        public double conversionRate;
        public double averageProcessingTimeMinutes;
        public BigDecimal totalRevenue;
        public double averageBasket;
        public double paymentRate;
        public long totalRequests;
        public long fulfilledRequests;
        public long totalInvoices;
        public long paidInvoices;
    }

    public KPIs calculateTenantKPIs(UUID tenantId, LocalDateTime from, LocalDateTime to) {
        List<ServiceRequest> requests = serviceRequestRepository.findAllByTenantIdAndRequestedAtBetween(tenantId, from, to);
        List<Invoice> invoices = invoiceRepository.findAll();

        KPIs kpis = new KPIs();

        kpis.totalRequests = requests.size();
        kpis.fulfilledRequests = requests.stream().filter(r -> r.getStatus() == ServiceRequest.Status.FULFILLED).count();
        kpis.conversionRate = kpis.totalRequests > 0 ? (kpis.fulfilledRequests * 100.0 / kpis.totalRequests) : 0.0;

        // Temps moyen de réalisation
        kpis.averageProcessingTimeMinutes = requests.stream()
                .filter(r -> r.getStatus() == ServiceRequest.Status.FULFILLED)
                .filter(r -> r.getRequestedAt() != null && r.getFulfilledAt() != null)
                .mapToLong(r -> Duration.between(r.getRequestedAt(), r.getFulfilledAt()).toMinutes())
                .average()
                .orElse(0.0);

        kpis.totalInvoices = invoices.size();
        kpis.paidInvoices = invoices.stream().filter(i -> i.getStatus() == Invoice.Status.PAID).count();
        kpis.paymentRate = kpis.totalInvoices > 0 ? (kpis.paidInvoices * 100.0 / kpis.totalInvoices) : 0.0;

        // Chiffre d'affaires
        kpis.totalRevenue = invoices.stream()
                .filter(i -> i.getStatus() == Invoice.Status.PAID)
                .map(Invoice::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Panier moyen
        kpis.averageBasket = kpis.paidInvoices > 0
                ? kpis.totalRevenue.doubleValue() / kpis.paidInvoices
                : 0.0;

        return kpis;
    }
}