package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.ServiceRequest;
import com.bizcore.bizcore_backend.dto.ServiceRequestDTO;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.service.ServiceRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/service-requests")
@Tag(name = "Service Requests", description = "Gestion des demandes de service (CdS → FdS)")
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    public ServiceRequestController(ServiceRequestService serviceRequestService) {
        this.serviceRequestService = serviceRequestService;
    }

    @GetMapping
    @Operation(summary = "Lister toutes les demandes avec pagination")
    public Page<ServiceRequestDTO> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("requestedAt").descending());
        return serviceRequestService.findAll(pageable).map(ServiceRequestDTO::fromEntity);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Trouver une demande par ID")
    public ResponseEntity<ServiceRequestDTO> findById(@PathVariable UUID id) {
        ServiceRequest request = serviceRequestService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest", id.toString()));
        return ResponseEntity.ok(ServiceRequestDTO.fromEntity(request));
    }

    @GetMapping("/consumer/{consumerId}")
    @Operation(summary = "Demandes d'un consommateur (émetteur)")
    public List<ServiceRequestDTO> findByConsumer(@PathVariable UUID consumerId) {
        return serviceRequestService.findByConsumer(consumerId).stream()
                .map(ServiceRequestDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/provider/{providerId}")
    @Operation(summary = "Demandes reçues par un fournisseur (récepteur)")
    public List<ServiceRequestDTO> findByProvider(@PathVariable UUID providerId) {
        return serviceRequestService.findByProvider(providerId).stream()
                .map(ServiceRequestDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Demandes par statut")
    public List<ServiceRequestDTO> findByStatus(@PathVariable ServiceRequest.Status status) {
        return serviceRequestService.findByStatus(status).stream()
                .map(ServiceRequestDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @PostMapping("/consumer/{consumerId}/provider/{providerId}/business/{businessId}")
    @Operation(summary = "Créer une demande de service")
    public ResponseEntity<ServiceRequestDTO> create(
            @PathVariable UUID consumerId,
            @PathVariable UUID providerId,
            @PathVariable UUID businessId,
            @Valid @RequestBody ServiceRequestDTO dto) {
        ServiceRequest request = new ServiceRequest();
        request.setServiceName(dto.getServiceName());
        request.setDescription(dto.getDescription());
        ServiceRequest saved = serviceRequestService.save(consumerId, providerId, businessId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ServiceRequestDTO.fromEntity(saved));
    }

    @PatchMapping("/{id}/fulfill")
    @Operation(summary = "Marquer une demande comme accomplie (ACK)")
    public ResponseEntity<ServiceRequestDTO> fulfill(@PathVariable UUID id) {
        return ResponseEntity.ok(ServiceRequestDTO.fromEntity(serviceRequestService.fulfill(id)));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Annuler une demande de service")
    public ResponseEntity<ServiceRequestDTO> cancel(@PathVariable UUID id) {
        return ResponseEntity.ok(ServiceRequestDTO.fromEntity(serviceRequestService.cancel(id)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une demande")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        serviceRequestService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}