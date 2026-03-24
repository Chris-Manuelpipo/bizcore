package com.bizcore.bizcore_backend.dto;

import com.bizcore.bizcore_backend.domain.Resource;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.UUID;

public class ResourceDTO {

    private UUID id;
    private UUID businessId;
    private String businessName;

    @NotBlank(message = "Le nom de la ressource est obligatoire")
    private String name;

    @NotBlank(message = "Le type de ressource est obligatoire")
    private String type;

    private Integer quantityAvailable;
    private String description;
    private LocalDateTime createdAt;

    public ResourceDTO() {}

    public static ResourceDTO fromEntity(Resource resource) {
        ResourceDTO dto = new ResourceDTO();
        dto.setId(resource.getId());
        dto.setName(resource.getName());
        dto.setType(resource.getType());
        dto.setQuantityAvailable(resource.getQuantityAvailable());
        dto.setDescription(resource.getDescription());
        dto.setCreatedAt(resource.getCreatedAt());
        if (resource.getBusiness() != null) {
            dto.setBusinessId(resource.getBusiness().getId());
            dto.setBusinessName(resource.getBusiness().getName());
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

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Integer getQuantityAvailable() { return quantityAvailable; }
    public void setQuantityAvailable(Integer quantityAvailable) { this.quantityAvailable = quantityAvailable; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
