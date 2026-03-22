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

    private UUID businessId;
    private String businessName;

    @NotBlank(message = "Le nom du service est obligatoire")
    private String serviceName;

    private String description;
    private ServiceRequest.Status status;
    private LocalDateTime requestedAt;
    private LocalDateTime fulfilledAt;

    public ServiceRequestDTO() {}

    public static ServiceRequestDTO fromEntity(ServiceRequest request) {
        ServiceRequestDTO dto = new ServiceRequestDTO();
        dto.setId(request.getId());
        dto.setServiceName(request.getServiceName());
        dto.setDescription(request.getDescription());
        dto.setStatus(request.getStatus());
        dto.setRequestedAt(request.getRequestedAt());
        dto.setFulfilledAt(request.getFulfilledAt());

        if (request.getConsumer() != null) {
            dto.setConsumerId(request.getConsumer().getId());
            if (request.getConsumer().getPerson() != null) {
                dto.setConsumerName(request.getConsumer().getPerson().getFirstName()
                        + " " + request.getConsumer().getPerson().getLastName());
            }
        }
        if (request.getProvider() != null) {
            dto.setProviderId(request.getProvider().getId());
            if (request.getProvider().getPerson() != null) {
                dto.setProviderName(request.getProvider().getPerson().getFirstName()
                        + " " + request.getProvider().getPerson().getLastName());
            }
        }
        if (request.getBusiness() != null) {
            dto.setBusinessId(request.getBusiness().getId());
            dto.setBusinessName(request.getBusiness().getName());
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
}