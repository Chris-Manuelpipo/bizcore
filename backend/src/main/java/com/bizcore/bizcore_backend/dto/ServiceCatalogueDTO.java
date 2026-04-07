package com.bizcore.bizcore_backend.dto;

import com.bizcore.bizcore_backend.domain.ServiceCatalogue;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class ServiceCatalogueDTO {

    private UUID id;
    private UUID businessId;
    private String businessName;

    @NotBlank(message = "Le nom du service est obligatoire")
    private String name;

    private String description;
    private BigDecimal basePrice;
    private String currency;
    private Boolean isAvailable;
    private LocalDateTime createdAt;

    public ServiceCatalogueDTO() {}

    public static ServiceCatalogueDTO fromEntity(ServiceCatalogue serviceCatalogue) {
        ServiceCatalogueDTO dto = new ServiceCatalogueDTO();
        dto.setId(serviceCatalogue.getId());
        dto.setName(serviceCatalogue.getName());
        dto.setDescription(serviceCatalogue.getDescription());
        dto.setBasePrice(serviceCatalogue.getBasePrice());
        dto.setCurrency(serviceCatalogue.getCurrency());
        dto.setIsAvailable(serviceCatalogue.getIsAvailable());
        dto.setCreatedAt(serviceCatalogue.getCreatedAt());
        if (serviceCatalogue.getBusiness() != null) {
            dto.setBusinessId(serviceCatalogue.getBusiness().getId());
            dto.setBusinessName(serviceCatalogue.getBusiness().getName());
        }
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getBusinessId() { return businessId; }
    public void setBusinessId(UUID businessId) { this.businessId = businessId; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
