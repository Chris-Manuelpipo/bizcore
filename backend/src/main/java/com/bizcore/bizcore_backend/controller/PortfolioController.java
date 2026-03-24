package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.Portfolio;
import com.bizcore.bizcore_backend.dto.PortfolioDTO;
import com.bizcore.bizcore_backend.service.PortfolioService;
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
@RequestMapping("/api/portfolios")
@Tag(name = "Portfolios", description = "Gestion des portfolios d'acteurs")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping
    @Operation(summary = "Lister tous les portfolios")
    public List<PortfolioDTO> findAll() {
        return portfolioService.findAll().stream()
                .map(PortfolioDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Trouver un portfolio par ID")
    public ResponseEntity<PortfolioDTO> findById(@PathVariable UUID id) {
        return portfolioService.findById(id)
                .map(PortfolioDTO::fromEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/actor/{actorId}")
    @Operation(summary = "Trouver le portfolio d'un acteur")
    public ResponseEntity<PortfolioDTO> findByActorId(@PathVariable UUID actorId) {
        return portfolioService.findByActorId(actorId)
                .map(PortfolioDTO::fromEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/actor/{actorId}")
    @Operation(summary = "Créer un portfolio pour un acteur")
    public ResponseEntity<PortfolioDTO> create(@PathVariable UUID actorId,
                                                @Valid @RequestBody Portfolio portfolio) {
        Portfolio saved = portfolioService.save(actorId, portfolio);
        return ResponseEntity.status(HttpStatus.CREATED).body(PortfolioDTO.fromEntity(saved));
    }

    @PatchMapping("/{portfolioId}/businesses/{businessId}")
    @Operation(summary = "Ajouter un métier au portfolio")
    public ResponseEntity<PortfolioDTO> addBusiness(@PathVariable UUID portfolioId,
                                                    @PathVariable UUID businessId) {
        Portfolio updated = portfolioService.addBusiness(portfolioId, businessId);
        return ResponseEntity.ok(PortfolioDTO.fromEntity(updated));
    }

    @DeleteMapping("/{portfolioId}/businesses/{businessId}")
    @Operation(summary = "Retirer un métier du portfolio")
    public ResponseEntity<PortfolioDTO> removeBusiness(@PathVariable UUID portfolioId,
                                                       @PathVariable UUID businessId) {
        Portfolio updated = portfolioService.removeBusiness(portfolioId, businessId);
        return ResponseEntity.ok(PortfolioDTO.fromEntity(updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un portfolio")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        portfolioService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}