package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.Portfolio;
import com.bizcore.bizcore_backend.service.PortfolioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portfolios")
@Tag(name = "Portfolios", description = "Gestion des portfolios d'acteurs")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping
    @Operation(summary = "Lister tous les portfolios")
    public List<Portfolio> findAll() {
        return portfolioService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Trouver un portfolio par ID")
    public ResponseEntity<Portfolio> findById(@PathVariable UUID id) {
        return portfolioService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/actor/{actorId}")
    @Operation(summary = "Trouver le portfolio d'un acteur")
    public ResponseEntity<Portfolio> findByActorId(@PathVariable UUID actorId) {
        return portfolioService.findByActorId(actorId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/actor/{actorId}")
    @Operation(summary = "Créer un portfolio pour un acteur")
    public ResponseEntity<Portfolio> create(@PathVariable UUID actorId,
                                            @Valid @RequestBody Portfolio portfolio) {
        Portfolio saved = portfolioService.save(actorId, portfolio);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/{portfolioId}/businesses/{businessId}")
    @Operation(summary = "Ajouter un métier au portfolio")
    public ResponseEntity<Portfolio> addBusiness(@PathVariable UUID portfolioId,
                                                 @PathVariable UUID businessId) {
        return ResponseEntity.ok(portfolioService.addBusiness(portfolioId, businessId));
    }

    @DeleteMapping("/{portfolioId}/businesses/{businessId}")
    @Operation(summary = "Retirer un métier du portfolio")
    public ResponseEntity<Portfolio> removeBusiness(@PathVariable UUID portfolioId,
                                                    @PathVariable UUID businessId) {
        return ResponseEntity.ok(portfolioService.removeBusiness(portfolioId, businessId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un portfolio")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        portfolioService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}