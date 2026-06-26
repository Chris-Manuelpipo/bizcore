package com.bizcore.bizcore_backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Génération d'une clé API avec création automatique du tenant associé")
public class CreateApiKeyDTO {

    @Schema(description = "Nom d'identification de la clé", example = "Production — app mobile", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank
    private String name;

    @Schema(description = "Nom du tenant à créer", example = "Campharma", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank
    private String tenantName;

    @Schema(description = "Domaine métier du tenant", example = "pharmacie-centrale", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank
    private String tenantDomain;

    @Schema(description = "Description du tenant", example = "Instance pharmacie du groupe central")
    private String tenantDescription;

    @Schema(description = "Durée de validité de la clé en jours (null = pas d'expiration)", example = "365")
    private Integer expiresInDays;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTenantName() { return tenantName; }
    public void setTenantName(String tenantName) { this.tenantName = tenantName; }

    public String getTenantDomain() { return tenantDomain; }
    public void setTenantDomain(String tenantDomain) { this.tenantDomain = tenantDomain; }

    public String getTenantDescription() { return tenantDescription; }
    public void setTenantDescription(String tenantDescription) { this.tenantDescription = tenantDescription; }

    public Integer getExpiresInDays() { return expiresInDays; }
    public void setExpiresInDays(Integer expiresInDays) { this.expiresInDays = expiresInDays; }
}
