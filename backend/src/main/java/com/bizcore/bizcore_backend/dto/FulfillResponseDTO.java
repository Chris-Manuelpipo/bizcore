package com.bizcore.bizcore_backend.dto;

import com.bizcore.bizcore_backend.domain.Invoice;
import com.bizcore.bizcore_backend.domain.ServiceRequest;
import java.time.LocalDateTime;
import java.util.UUID;

public class FulfillResponseDTO {
    
    private ServiceRequestDTO serviceRequest;
    private InvoiceDTO invoice;
    
    public FulfillResponseDTO() {}
    
    public FulfillResponseDTO(ServiceRequestDTO serviceRequest, InvoiceDTO invoice) {
        this.serviceRequest = serviceRequest;
        this.invoice = invoice;
    }
    
    public static FulfillResponseDTO fromEntities(ServiceRequest serviceRequest, Invoice invoice) {
        return new FulfillResponseDTO(
            ServiceRequestDTO.fromEntity(serviceRequest),
            InvoiceDTO.fromEntity(invoice)
        );
    }
    
    public ServiceRequestDTO getServiceRequest() { return serviceRequest; }
    public void setServiceRequest(ServiceRequestDTO serviceRequest) { this.serviceRequest = serviceRequest; }
    
    public InvoiceDTO getInvoice() { return invoice; }
    public void setInvoice(InvoiceDTO invoice) { this.invoice = invoice; }
}
