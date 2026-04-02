package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.Business;
import com.bizcore.bizcore_backend.domain.Tenant;
import com.bizcore.bizcore_backend.dto.BusinessDTO;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.repository.TenantRepository;
import com.bizcore.bizcore_backend.service.BusinessService;
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
@RequestMapping("/api/businesses")
@Tag(name = "Businesses", description = "Gestion des métiers")
public class BusinessController {

    private final BusinessService businessService;
    private final TenantRepository tenantRepository;

    public BusinessController(BusinessService businessService, TenantRepository tenantRepository) {
        this.businessService = businessService;
        this.tenantRepository = tenantRepository;
    }

    @GetMapping
    @Operation(summary = "Lister tous les métiers avec pagination")
    public Page<BusinessDTO> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).ascending());
        return businessService.findAll(pageable).map(BusinessDTO::fromEntity);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Trouver un métier par ID")
    public ResponseEntity<BusinessDTO> findById(@PathVariable UUID id) {
        Business business = businessService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business", id.toString()));
        return ResponseEntity.ok(BusinessDTO.fromEntity(business));
    }

    @GetMapping("/domain/{domain}")
    @Operation(summary = "Lister les métiers par domaine")
    public List<BusinessDTO> findByDomain(@PathVariable String domain) {
        return businessService.findByDomain(domain).stream()
                .map(BusinessDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/search")
    @Operation(summary = "Rechercher un métier par nom")
    public List<BusinessDTO> search(@RequestParam String name) {
        return businessService.search(name).stream()
                .map(BusinessDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @PostMapping
    @Operation(summary = "Créer un nouveau métier")
    public ResponseEntity<BusinessDTO> create(@Valid @RequestBody BusinessDTO dto) {
        Business business = dto.toEntity();

        // Récupérer et assigner le tenant si fourni
        if (dto.getTenantId() != null) {
            Tenant tenant = tenantRepository.findById(dto.getTenantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Tenant", dto.getTenantId().toString()));
            business.setTenant(tenant);
        }

        Business saved = businessService.save(business);
        return ResponseEntity.status(HttpStatus.CREATED).body(BusinessDTO.fromEntity(saved));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un métier")
    public ResponseEntity<BusinessDTO> update(@PathVariable UUID id,
                                              @Valid @RequestBody BusinessDTO dto) {
        Business updated = businessService.update(id, dto.toEntity());
        return ResponseEntity.ok(BusinessDTO.fromEntity(updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un métier")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        businessService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}