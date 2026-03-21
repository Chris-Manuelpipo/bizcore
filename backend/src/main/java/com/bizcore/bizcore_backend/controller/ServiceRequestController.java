package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.ServiceRequest;
import com.bizcore.bizcore_backend.service.ServiceRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/service-requests")
@Tag(name = "Service Requests", description = "Gestion des demandes de service (CdS → FdS)")
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    public ServiceRequestController(ServiceRequestService serviceRequestService) {
        this.serviceRequestService = serviceRequestService;
    }

    @GetMapping
    @Operation(summary = "Lister toutes les demandes de service")
    public List<ServiceRequest> findAll() {
        return serviceRequestService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Trouver une demande par ID")
    public ResponseEntity<ServiceRequest> findById(@PathVariable UUID id) {
        return serviceRequestService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/consumer/{consumerId}")
    @Operation(summary = "Demandes d'un consommateur (émetteur)")
    public List<ServiceRequest> findByConsumer(@PathVariable UUID consumerId) {
        return serviceRequestService.findByConsumer(consumerId);
    }

    @GetMapping("/provider/{providerId}")
    @Operation(summary = "Demandes reçues par un fournisseur (récepteur)")
    public List<ServiceRequest> findByProvider(@PathVariable UUID providerId) {
        return serviceRequestService.findByProvider(providerId);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Demandes par statut")
    public List<ServiceRequest> findByStatus(@PathVariable ServiceRequest.Status status) {
        return serviceRequestService.findByStatus(status);
    }

    @PostMapping("/consumer/{consumerId}/provider/{providerId}/business/{businessId}")
    @Operation(summary = "Créer une demande de service")
    public ResponseEntity<ServiceRequest> create(
            @PathVariable UUID consumerId,
            @PathVariable UUID providerId,
            @PathVariable UUID businessId,
            @Valid @RequestBody ServiceRequest request) {
        ServiceRequest saved = serviceRequestService.save(consumerId, providerId, businessId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/{id}/fulfill")
    @Operation(summary = "Marquer une demande comme accomplie (ACK)")
    public ResponseEntity<ServiceRequest> fulfill(@PathVariable UUID id) {
        return ResponseEntity.ok(serviceRequestService.fulfill(id));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Annuler une demande de service")
    public ResponseEntity<ServiceRequest> cancel(@PathVariable UUID id) {
        return ResponseEntity.ok(serviceRequestService.cancel(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une demande")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        serviceRequestService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}