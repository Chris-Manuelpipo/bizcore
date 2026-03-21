package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.Actor;
import com.bizcore.bizcore_backend.service.ActorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/actors")
@Tag(name = "Actors", description = "Gestion des acteurs métier")
public class ActorController {

    private final ActorService actorService;

    public ActorController(ActorService actorService) {
        this.actorService = actorService;
    }

    @GetMapping
    @Operation(summary = "Lister tous les acteurs")
    public List<Actor> findAll() {
        return actorService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Trouver un acteur par ID")
    public ResponseEntity<Actor> findById(@PathVariable UUID id) {
        return actorService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/person/{personId}")
    @Operation(summary = "Lister les acteurs d'une personne")
    public List<Actor> findByPersonId(@PathVariable UUID personId) {
        return actorService.findByPersonId(personId);
    }

    @GetMapping("/role/{role}")
    @Operation(summary = "Lister les acteurs par rôle")
    public List<Actor> findByRole(@PathVariable String role) {
        return actorService.findByRole(role);
    }

    @PostMapping("/person/{personId}")
    @Operation(summary = "Créer un acteur pour une personne")
    public ResponseEntity<Actor> create(@PathVariable UUID personId,
                                        @Valid @RequestBody Actor actor) {
        Actor saved = actorService.save(personId, actor);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un acteur")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        actorService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}