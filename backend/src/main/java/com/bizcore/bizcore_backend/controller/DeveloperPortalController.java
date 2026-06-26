package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.Developer;
import com.bizcore.bizcore_backend.domain.Tenant;
import com.bizcore.bizcore_backend.dto.ApiKeyDTO;
import com.bizcore.bizcore_backend.dto.CreateApiKeyDTO;
import com.bizcore.bizcore_backend.dto.CreateApiKeyResponseDTO;
import com.bizcore.bizcore_backend.dto.CreateTenantDTO;
import com.bizcore.bizcore_backend.security.DeveloperContextService;
import com.bizcore.bizcore_backend.service.ApiKeyService;
import com.bizcore.bizcore_backend.service.DeveloperTenantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/developer")
@PreAuthorize("hasRole('DEVELOPER')")
@Tag(name = "Developer Portal", description = """
        Espace développeur — gestion des tenants et clés API.

        Prérequis : JWT développeur (developerBearerAuth) obtenu via /api/dev-auth/login.
        Le développeur connecté est résolu automatiquement depuis le token — aucun champ \
        prénom/nom/email dans ces requêtes.
        """)
@SecurityRequirement(name = "developerBearerAuth")
public class DeveloperPortalController {

    private final DeveloperContextService developerContext;
    private final ApiKeyService apiKeyService;
    private final DeveloperTenantService developerTenantService;

    public DeveloperPortalController(DeveloperContextService developerContext,
                                     ApiKeyService apiKeyService,
                                     DeveloperTenantService developerTenantService) {
        this.developerContext = developerContext;
        this.apiKeyService = apiKeyService;
        this.developerTenantService = developerTenantService;
    }

    @GetMapping("/me")
    @Operation(summary = "Profil du développeur connecté",
            description = "Retourne id, email, prénom et nom du développeur identifié par le JWT.")
    public Map<String, Object> me() {
        Developer dev = developerContext.requireCurrentDeveloper();
        return Map.of(
                "id", dev.getId(),
                "email", dev.getEmail(),
                "firstName", dev.getFirstName(),
                "lastName", dev.getLastName()
        );
    }

    @GetMapping("/tenants")
    @Operation(summary = "Lister les tenants créés par le développeur")
    public List<Tenant> listTenants() {
        return developerTenantService.listForDeveloper(developerContext.requireCurrentDeveloper());
    }

    @PostMapping("/tenants")
    @Operation(summary = "Créer un tenant rattaché au développeur")
    public ResponseEntity<Tenant> createTenant(@Valid @RequestBody CreateTenantDTO dto) {
        Tenant tenant = new Tenant();
        tenant.setName(dto.getName());
        tenant.setDomain(dto.getDomain());
        tenant.setDescription(dto.getDescription());
        Tenant created = developerTenantService.create(
                developerContext.requireCurrentDeveloper(), tenant);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/api-keys")
    @Operation(summary = "Lister les clés API du développeur")
    public List<ApiKeyDTO> listApiKeys() {
        return apiKeyService.listForDeveloper(developerContext.requireCurrentDeveloper());
    }

    @PostMapping("/api-keys")
    @Operation(
            summary = "Générer une clé API et créer le tenant associé",
            description = """
                    Crée un nouveau tenant (tenantName, tenantDomain, tenantDescription) \
                    puis génère une clé API rattachée. Le secret brut n'est retourné qu'une seule fois.
                    """,
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(schema = @Schema(implementation = CreateApiKeyDTO.class))
            ),
            responses = {
                    @ApiResponse(responseCode = "201", description = "Clé créée — copier secretKey immédiatement"),
                    @ApiResponse(responseCode = "400", description = "Nom de tenant déjà pris ou champs invalides"),
                    @ApiResponse(responseCode = "401", description = "JWT développeur manquant ou invalide")
            }
    )
    public ResponseEntity<CreateApiKeyResponseDTO> createApiKey(@Valid @RequestBody CreateApiKeyDTO dto) {
        CreateApiKeyResponseDTO created = apiKeyService.create(
                developerContext.requireCurrentDeveloper(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/api-keys/{id}")
    @Operation(summary = "Révoquer une clé API")
    public ResponseEntity<Void> revokeApiKey(@PathVariable UUID id) {
        apiKeyService.revoke(developerContext.requireCurrentDeveloper(), id);
        return ResponseEntity.noContent().build();
    }
}
