package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.ServiceCatalogue;
import com.bizcore.bizcore_backend.service.ServiceCatalogueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/service-catalogues")
@Tag(name = "Service Catalogues", description = "Catalogue des services offerts par chaque métier")
public class ServiceCatalogueController {

    private final ServiceCatalogueService serviceCatalogueService;

    public ServiceCatalogueController(ServiceCatalogueService serviceCatalogueService) {
        this.serviceCatalogueService = serviceCatalogueService;
    }

    @GetMapping
    @Operation(summary = "Lister tous les services du catalogue")
    public List<ServiceCatalogue> findAll() {
        return serviceCatalogueService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Trouver un service par ID")
    public ResponseEntity<ServiceCatalogue> findById(@PathVariable UUID id) {
        return serviceCatalogueService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/business/{businessId}")
    @Operation(summary = "Lister les services d'un métier")
    public List<ServiceCatalogue> findByBusiness(@PathVariable UUID businessId) {
        return serviceCatalogueService.findByBusinessId(businessId);
    }

    @GetMapping("/available")
    @Operation(summary = "Lister les services disponibles")
    public List<ServiceCatalogue> findAvailable() {
        return serviceCatalogueService.findAvailable();
    }

    @GetMapping("/search")
    @Operation(summary = "Rechercher un service par nom")
    public List<ServiceCatalogue> search(@RequestParam String name) {
        return serviceCatalogueService.search(name);
    }

    @PostMapping("/business/{businessId}")
    @Operation(summary = "Ajouter un service au catalogue d'un métier")
    public ResponseEntity<ServiceCatalogue> create(@PathVariable UUID businessId,
                                                   @Valid @RequestBody ServiceCatalogue catalogue) {
        ServiceCatalogue saved = serviceCatalogueService.save(businessId, catalogue);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un service du catalogue")
    public ResponseEntity<ServiceCatalogue> update(@PathVariable UUID id,
                                                   @Valid @RequestBody ServiceCatalogue catalogue) {
        return ResponseEntity.ok(serviceCatalogueService.update(id, catalogue));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un service du catalogue")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        serviceCatalogueService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
