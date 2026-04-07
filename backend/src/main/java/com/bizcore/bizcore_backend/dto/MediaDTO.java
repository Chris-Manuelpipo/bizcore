package com.bizcore.bizcore_backend.dto;

import com.bizcore.bizcore_backend.domain.Media;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.UUID;

public class MediaDTO {

    private UUID id;
    private UUID businessId;
    private String businessName;

    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    @NotBlank(message = "L'URL est obligatoire")
    private String url;

    @NotBlank(message = "Le type est obligatoire")
    private String type;

    private String description;
    private LocalDateTime createdAt;

    public MediaDTO() {}

    public static MediaDTO fromEntity(Media media) {
        MediaDTO dto = new MediaDTO();
        dto.setId(media.getId());
        dto.setName(media.getName());
        dto.setUrl(media.getUrl());
        dto.setType(media.getType());
        dto.setDescription(media.getDescription());
        dto.setCreatedAt(media.getCreatedAt());
        if (media.getBusiness() != null) {
            dto.setBusinessId(media.getBusiness().getId());
            dto.setBusinessName(media.getBusiness().getName());
        }
        return dto;
    }

    public Media toEntity() {
        Media media = new Media();
        media.setName(this.name);
        media.setUrl(this.url);
        media.setType(this.type);
        media.setDescription(this.description);
        return media;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getBusinessId() { return businessId; }
    public void setBusinessId(UUID businessId) { this.businessId = businessId; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
