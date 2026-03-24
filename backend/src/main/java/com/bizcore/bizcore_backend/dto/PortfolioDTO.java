package com.bizcore.bizcore_backend.dto;

import com.bizcore.bizcore_backend.domain.Portfolio;
import com.bizcore.bizcore_backend.domain.Business;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class PortfolioDTO {

    private UUID id;
    private UUID actorId;
    private String actorRole;

    @NotBlank(message = "Le titre est obligatoire")
    private String title;

    private String description;
    private List<BusinessSummaryDTO> businesses = new ArrayList<>();
    private LocalDateTime createdAt;

    public PortfolioDTO() {}

    public static PortfolioDTO fromEntity(Portfolio portfolio) {
        PortfolioDTO dto = new PortfolioDTO();
        dto.setId(portfolio.getId());
        dto.setTitle(portfolio.getTitle());
        dto.setDescription(portfolio.getDescription());
        dto.setCreatedAt(portfolio.getCreatedAt());
        if (portfolio.getActor() != null) {
            dto.setActorId(portfolio.getActor().getId());
            dto.setActorRole(portfolio.getActor().getRole());
        }
        if (portfolio.getBusinesses() != null) {
            dto.setBusinesses(portfolio.getBusinesses().stream()
                    .map(BusinessSummaryDTO::fromEntity)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getActorId() { return actorId; }
    public void setActorId(UUID actorId) { this.actorId = actorId; }

    public String getActorRole() { return actorRole; }
    public void setActorRole(String actorRole) { this.actorRole = actorRole; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<BusinessSummaryDTO> getBusinesses() { return businesses; }
    public void setBusinesses(List<BusinessSummaryDTO> businesses) { this.businesses = businesses; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    /**
     * Nested DTO for business summary in Portfolio.
     */
    public static class BusinessSummaryDTO {
        private UUID id;
        private String name;
        private String domain;

        public BusinessSummaryDTO() {}

        public static BusinessSummaryDTO fromEntity(Business business) {
            BusinessSummaryDTO dto = new BusinessSummaryDTO();
            dto.setId(business.getId());
            dto.setName(business.getName());
            dto.setDomain(business.getDomain());
            return dto;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDomain() { return domain; }
        public void setDomain(String domain) { this.domain = domain; }
    }
}
