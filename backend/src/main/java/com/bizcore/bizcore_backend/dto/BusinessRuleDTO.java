package com.bizcore.bizcore_backend.dto;

import com.bizcore.bizcore_backend.domain.BusinessRule;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.UUID;

public class BusinessRuleDTO {

    private UUID id;
    private UUID businessId;
    private String businessName;

    @NotBlank(message = "La clé de la règle est obligatoire")
    private String ruleKey;

    @NotBlank(message = "La valeur de la règle est obligatoire")
    private String ruleValue;

    private String description;
    private LocalDateTime createdAt;

    public BusinessRuleDTO() {}

    public static BusinessRuleDTO fromEntity(BusinessRule businessRule) {
        BusinessRuleDTO dto = new BusinessRuleDTO();
        dto.setId(businessRule.getId());
        dto.setRuleKey(businessRule.getRuleKey());
        dto.setRuleValue(businessRule.getRuleValue());
        dto.setDescription(businessRule.getDescription());
        dto.setCreatedAt(businessRule.getCreatedAt());
        if (businessRule.getBusiness() != null) {
            dto.setBusinessId(businessRule.getBusiness().getId());
            dto.setBusinessName(businessRule.getBusiness().getName());
        }
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getBusinessId() { return businessId; }
    public void setBusinessId(UUID businessId) { this.businessId = businessId; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getRuleKey() { return ruleKey; }
    public void setRuleKey(String ruleKey) { this.ruleKey = ruleKey; }

    public String getRuleValue() { return ruleValue; }
    public void setRuleValue(String ruleValue) { this.ruleValue = ruleValue; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
