package com.bizcore.bizcore_backend.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class CreateServiceCatalogueDTO {

    @NotBlank(message = "Le nom du service est obligatoire")
    private String name;

    private String description;
    private BigDecimal basePrice;
    private String currency;
    private Boolean isAvailable = true;

    public CreateServiceCatalogueDTO() {}

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
}
