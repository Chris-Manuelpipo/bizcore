package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.Actor;
import com.bizcore.bizcore_backend.domain.User;
import com.bizcore.bizcore_backend.dto.ActorDTO;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.repository.UserRepository;
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
    private final UserRepository userRepository;

    public ActorController(ActorService actorService, UserRepository userRepository) {
        this.actorService = actorService;
        this.userRepository = userRepository;
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

    @GetMapping("/user/{userId}")
    @Operation(summary = "Lister les acteurs d'un utilisateur")
    public List<ActorDTO> findByUserId(@PathVariable UUID userId) {
        return actorService.findByUserId(userId).stream()
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

    @PostMapping("/user/{userId}")
    @Operation(summary = "Créer un acteur pour un utilisateur")
    public ResponseEntity<ActorDTO> create(@PathVariable UUID userId,
                                           @Valid @RequestBody ActorDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));
        Actor actor = new Actor();
        actor.setUser(user);
        actor.setRole(dto.getRole());
        actor.setBio(dto.getBio());
        actor.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        Actor saved = actorService.save(userId, actor);
        return ResponseEntity.status(HttpStatus.CREATED).body(ActorDTO.fromEntity(saved));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un acteur")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        actorService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
