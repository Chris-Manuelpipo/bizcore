package com.bizcore.bizcore_backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Création d'un tenant rattaché au développeur connecté")
public class CreateTenantDTO {

    @Schema(description = "Nom de l'instance métier", example = "Campharma", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank
    private String name;

    @Schema(description = "Domaine métier", example = "pharmacie-centrale", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank
    private String domain;

    @Schema(description = "Description libre", example = "Instance pharmacie du groupe central")
    private String description;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
