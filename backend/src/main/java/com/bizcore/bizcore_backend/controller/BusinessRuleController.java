package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.BusinessRule;
import com.bizcore.bizcore_backend.service.BusinessRuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/business-rules")
@Tag(name = "Business Rules", description = "Règles métier — le protocole de chaque métier")
public class BusinessRuleController {

    private final BusinessRuleService businessRuleService;

    public BusinessRuleController(BusinessRuleService businessRuleService) {
        this.businessRuleService = businessRuleService;
    }

    @GetMapping
    @Operation(summary = "Lister toutes les règles métier")
    public List<BusinessRule> findAll() {
        return businessRuleService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Trouver une règle par ID")
    public ResponseEntity<BusinessRule> findById(@PathVariable UUID id) {
        return businessRuleService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/business/{businessId}")
    @Operation(summary = "Lister les règles d'un métier")
    public List<BusinessRule> findByBusiness(@PathVariable UUID businessId) {
        return businessRuleService.findByBusinessId(businessId);
    }

    @PostMapping("/business/{businessId}")
    @Operation(summary = "Ajouter une règle à un métier")
    public ResponseEntity<BusinessRule> create(@PathVariable UUID businessId,
                                               @Valid @RequestBody BusinessRule rule) {
        BusinessRule saved = businessRuleService.save(businessId, rule);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour une règle")
    public ResponseEntity<BusinessRule> update(@PathVariable UUID id,
                                               @Valid @RequestBody BusinessRule rule) {
        return ResponseEntity.ok(businessRuleService.update(id, rule));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une règle")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        businessRuleService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}