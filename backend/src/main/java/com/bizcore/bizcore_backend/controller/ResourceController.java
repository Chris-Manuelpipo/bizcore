package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.Resource;
import com.bizcore.bizcore_backend.dto.ResourceDTO;
import com.bizcore.bizcore_backend.service.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resources")
@Tag(name = "Resources", description = "Gestion des ressources métier")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    @Operation(summary = "Lister toutes les ressources")
    public List<ResourceDTO> findAll() {
        return resourceService.findAll().stream()
                .map(ResourceDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Trouver une ressource par ID")
    public ResponseEntity<ResourceDTO> findById(@PathVariable UUID id) {
        return resourceService.findById(id)
                .map(ResourceDTO::fromEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/business/{businessId}")
    @Operation(summary = "Lister les ressources d'un métier")
    public List<ResourceDTO> findByBusiness(@PathVariable UUID businessId) {
        return resourceService.findByBusinessId(businessId).stream()
                .map(ResourceDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @PostMapping("/business/{businessId}")
    @Operation(summary = "Ajouter une ressource à un métier")
    public ResponseEntity<ResourceDTO> create(@PathVariable UUID businessId,
                                              @Valid @RequestBody Resource resource) {
        Resource saved = resourceService.save(businessId, resource);
        return ResponseEntity.status(HttpStatus.CREATED).body(ResourceDTO.fromEntity(saved));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour une ressource")
    public ResponseEntity<ResourceDTO> update(@PathVariable UUID id,
                                               @Valid @RequestBody Resource resource) {
        Resource updated = resourceService.update(id, resource);
        return ResponseEntity.ok(ResourceDTO.fromEntity(updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une ressource")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        resourceService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}