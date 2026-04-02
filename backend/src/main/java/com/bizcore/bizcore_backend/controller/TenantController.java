package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.Tenant;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.service.TenantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tenants")
@Tag(name = "Tenants", description = "Provisionnement des instances métier (couche 3 BCaaS)")
public class TenantController {

    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @GetMapping
    @Operation(summary = "Lister tous les tenants actifs")
    public List<Tenant> findActive() {
        return tenantService.findActive();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Trouver un tenant par ID")
    public ResponseEntity<Tenant> findById(@PathVariable UUID id) {
        return tenantService.findById(id)
            .map(ResponseEntity::ok)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant", id.toString()));
    }

    @PostMapping("/register")
    @Operation(summary = "Enregistrer une nouvelle instance métier (provisionnement tenant)")
    public ResponseEntity<Tenant> register(@Valid @RequestBody Tenant tenant) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(tenantService.register(tenant));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un tenant")
    public ResponseEntity<Tenant> update(
            @PathVariable UUID id,
            @Valid @RequestBody Tenant tenant) {
        return ResponseEntity.ok(tenantService.update(id, tenant));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Désactiver un tenant (soft delete)")
    public ResponseEntity<Void> deactivate(@PathVariable UUID id) {
        tenantService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}