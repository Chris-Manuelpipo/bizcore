package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.Actor;
import com.bizcore.bizcore_backend.domain.Tenant;
import com.bizcore.bizcore_backend.dto.ActorDTO;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.repository.TenantRepository;
import com.bizcore.bizcore_backend.service.ActorService;
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
@RequestMapping("/api/actors")
@Tag(name = "Actors", description = "Gestion des acteurs métier")
public class ActorController {

    private final ActorService actorService;
    private final TenantRepository tenantRepository;

    public ActorController(ActorService actorService, TenantRepository tenantRepository) {
        this.actorService = actorService;
        this.tenantRepository = tenantRepository;
    }

    @GetMapping
    @Operation(summary = "Lister tous les acteurs avec pagination")
    public Page<ActorDTO> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return actorService.findAll(pageable).map(ActorDTO::fromEntity);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Trouver un acteur par ID")
    public ResponseEntity<ActorDTO> findById(@PathVariable UUID id) {
        Actor actor = actorService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Actor", id.toString()));
        return ResponseEntity.ok(ActorDTO.fromEntity(actor));
    }

    @GetMapping("/person/{personId}")
    @Operation(summary = "Lister les acteurs d'une personne")
    public List<ActorDTO> findByPersonId(@PathVariable UUID personId) {
        return actorService.findByPersonId(personId).stream()
                .map(ActorDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/role/{role}")
    @Operation(summary = "Lister les acteurs par rôle")
    public List<ActorDTO> findByRole(@PathVariable String role) {
        return actorService.findByRole(role).stream()
                .map(ActorDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @PostMapping("/person/{personId}")
    @Operation(summary = "Créer un acteur pour une personne")
    public ResponseEntity<ActorDTO> create(@PathVariable UUID personId,
                                           @Valid @RequestBody ActorDTO dto) {
        Actor actor = new Actor();
        actor.setRole(dto.getRole());
        actor.setBio(dto.getBio());
        actor.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        // Récupérer et assigner le tenant si fourni
        if (dto.getTenantId() != null) {
            Tenant tenant = tenantRepository.findById(dto.getTenantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Tenant", dto.getTenantId().toString()));
            actor.setTenant(tenant);
        }

        Actor saved = actorService.save(personId, actor);
        return ResponseEntity.status(HttpStatus.CREATED).body(ActorDTO.fromEntity(saved));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un acteur")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        actorService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}