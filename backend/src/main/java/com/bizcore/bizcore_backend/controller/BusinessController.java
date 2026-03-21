package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.Business;
import com.bizcore.bizcore_backend.service.BusinessService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/businesses")
@Tag(name = "Businesses", description = "Gestion des métiers")
public class BusinessController {

    private final BusinessService businessService;

    public BusinessController(BusinessService businessService) {
        this.businessService = businessService;
    }

    @GetMapping
    @Operation(summary = "Lister tous les métiers")
    public List<Business> findAll() {
        return businessService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Trouver un métier par ID")
    public ResponseEntity<Business> findById(@PathVariable UUID id) {
        return businessService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/domain/{domain}")
    @Operation(summary = "Lister les métiers par domaine")
    public List<Business> findByDomain(@PathVariable String domain) {
        return businessService.findByDomain(domain);
    }

    @GetMapping("/search")
    @Operation(summary = "Rechercher un métier par nom")
    public List<Business> search(@RequestParam String name) {
        return businessService.search(name);
    }

    @PostMapping
    @Operation(summary = "Créer un nouveau métier")
    public ResponseEntity<Business> create(@Valid @RequestBody Business business) {
        Business saved = businessService.save(business);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un métier")
    public ResponseEntity<Business> update(@PathVariable UUID id,
                                           @Valid @RequestBody Business business) {
        Business updated = businessService.update(id, business);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un métier")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        businessService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}