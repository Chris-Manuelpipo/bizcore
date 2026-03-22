package com.bizcore.bizcore_backend.dto;

import com.bizcore.bizcore_backend.domain.Business;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.UUID;

public class BusinessDTO {

    private UUID id;

    @NotBlank(message = "Le nom du métier est obligatoire")
    private String name;

    @NotBlank(message = "Le domaine est obligatoire")
    private String domain;

    private String description;
    private String neededEducation;
    private String neededTraining;
    private LocalDateTime createdAt;

    public BusinessDTO() {}

    public static BusinessDTO fromEntity(Business business) {
        BusinessDTO dto = new BusinessDTO();
        dto.setId(business.getId());
        dto.setName(business.getName());
        dto.setDomain(business.getDomain());
        dto.setDescription(business.getDescription());
        dto.setNeededEducation(business.getNeededEducation());
        dto.setNeededTraining(business.getNeededTraining());
        dto.setCreatedAt(business.getCreatedAt());
        return dto;
    }

    public Business toEntity() {
        Business business = new Business();
        business.setName(this.name);
        business.setDomain(this.domain);
        business.setDescription(this.description);
        business.setNeededEducation(this.neededEducation);
        business.setNeededTraining(this.neededTraining);
        return business;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getNeededEducation() { return neededEducation; }
    public void setNeededEducation(String neededEducation) { this.neededEducation = neededEducation; }

    public String getNeededTraining() { return neededTraining; }
    public void setNeededTraining(String neededTraining) { this.neededTraining = neededTraining; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}