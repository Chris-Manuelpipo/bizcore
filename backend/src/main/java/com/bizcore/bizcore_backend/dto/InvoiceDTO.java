package com.bizcore.bizcore_backend.dto;

import com.bizcore.bizcore_backend.domain.Invoice;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class InvoiceDTO {
    
    private UUID id;
    private UUID serviceRequestId;
    private BigDecimal amount;
    private String currency;
    private Invoice.Status status;
    private LocalDateTime issuedAt;
    private LocalDateTime paidAt;
    
    public InvoiceDTO() {}
    
    public InvoiceDTO(UUID id, UUID serviceRequestId, BigDecimal amount, String currency,
                      Invoice.Status status, LocalDateTime issuedAt, LocalDateTime paidAt) {
        this.id = id;
        this.serviceRequestId = serviceRequestId;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.issuedAt = issuedAt;
        this.paidAt = paidAt;
    }
    
    public static InvoiceDTO fromEntity(Invoice invoice) {
        return new InvoiceDTO(
            invoice.getId(),
            invoice.getServiceRequest().getId(),
            invoice.getAmount(),
            invoice.getCurrency(),
            invoice.getStatus(),
            invoice.getIssuedAt(),
            invoice.getPaidAt()
        );
    }
    
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public UUID getServiceRequestId() { return serviceRequestId; }
    public void setServiceRequestId(UUID serviceRequestId) { this.serviceRequestId = serviceRequestId; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public Invoice.Status getStatus() { return status; }
    public void setStatus(Invoice.Status status) { this.status = status; }
    
    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }
    
    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
}
