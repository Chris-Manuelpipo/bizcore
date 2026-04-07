package com.bizcore.bizcore_backend.dto;

import com.bizcore.bizcore_backend.domain.ServiceRequest;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.UUID;

public class ServiceRequestDTO {

    private UUID id;

    private UUID consumerId;
    private String consumerName;

    private UUID providerId;
    private String providerName;

    private UUID serviceCatalogueId;
    private String serviceCatalogueName;

    private UUID businessId;
    private String businessName;

    @NotBlank(message = "Le nom du service est obligatoire")
    private String serviceName;

    private String description;
    private ServiceRequest.Status status;
    private LocalDateTime requestedAt;
    private LocalDateTime fulfilledAt;
    private UUID traceId;
    private UUID correlationId;
    private LocalDateTime acceptedAt;
    private LocalDateTime startedAt;
    private LocalDateTime cancelledAt;

    public ServiceRequestDTO() {}

    public static ServiceRequestDTO fromEntity(ServiceRequest request) {
        ServiceRequestDTO dto = new ServiceRequestDTO();
        dto.setId(request.getId());
        dto.setServiceName(request.getServiceName());
        dto.setDescription(request.getDescription());
        dto.setStatus(request.getStatus());
        dto.setRequestedAt(request.getRequestedAt());
        dto.setFulfilledAt(request.getFulfilledAt());
        dto.setTraceId(request.getTraceId());
        dto.setCorrelationId(request.getCorrelationId());
        dto.setAcceptedAt(request.getAcceptedAt());
        dto.setStartedAt(request.getStartedAt());
        dto.setCancelledAt(request.getCancelledAt());

        if (request.getConsumer() != null) {
            dto.setConsumerId(request.getConsumer().getId());
            if (request.getConsumer().getUser() != null) {
                dto.setConsumerName(request.getConsumer().getUser().getFirstName()
                        + " " + request.getConsumer().getUser().getLastName());
            }
        }
        if (request.getProvider() != null) {
            dto.setProviderId(request.getProvider().getId());
            if (request.getProvider().getUser() != null) {
                dto.setProviderName(request.getProvider().getUser().getFirstName()
                        + " " + request.getProvider().getUser().getLastName());
            }
        }
        if (request.getServiceCatalogue() != null) {
            dto.setServiceCatalogueId(request.getServiceCatalogue().getId());
            dto.setServiceCatalogueName(request.getServiceCatalogue().getName());
            if (request.getServiceCatalogue().getBusiness() != null) {
                dto.setBusinessId(request.getServiceCatalogue().getBusiness().getId());
                dto.setBusinessName(request.getServiceCatalogue().getBusiness().getName());
            }
        }
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getConsumerId() { return consumerId; }
    public void setConsumerId(UUID consumerId) { this.consumerId = consumerId; }

    public String getConsumerName() { return consumerName; }
    public void setConsumerName(String consumerName) { this.consumerName = consumerName; }

    public UUID getProviderId() { return providerId; }
    public void setProviderId(UUID providerId) { this.providerId = providerId; }

    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }

    public UUID getServiceCatalogueId() { return serviceCatalogueId; }
    public void setServiceCatalogueId(UUID serviceCatalogueId) { this.serviceCatalogueId = serviceCatalogueId; }

    public String getServiceCatalogueName() { return serviceCatalogueName; }
    public void setServiceCatalogueName(String serviceCatalogueName) { this.serviceCatalogueName = serviceCatalogueName; }

    public UUID getBusinessId() { return businessId; }
    public void setBusinessId(UUID businessId) { this.businessId = businessId; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ServiceRequest.Status getStatus() { return status; }
    public void setStatus(ServiceRequest.Status status) { this.status = status; }

    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }

    public LocalDateTime getFulfilledAt() { return fulfilledAt; }
    public void setFulfilledAt(LocalDateTime fulfilledAt) { this.fulfilledAt = fulfilledAt; }

    public UUID getTraceId() { return traceId; }
    public void setTraceId(UUID traceId) { this.traceId = traceId; }

    public UUID getCorrelationId() { return correlationId; }
    public void setCorrelationId(UUID correlationId) { this.correlationId = correlationId; }

    public LocalDateTime getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(LocalDateTime acceptedAt) { this.acceptedAt = acceptedAt; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
}
