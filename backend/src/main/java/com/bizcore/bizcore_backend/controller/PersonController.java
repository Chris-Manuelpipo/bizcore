package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.Person;
import com.bizcore.bizcore_backend.service.PersonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/persons")
@Tag(name = "Persons", description = "Gestion des personnes")
public class PersonController {

    private final PersonService personService;

    public PersonController(PersonService personService) {
        this.personService = personService;
    }

    @GetMapping
    @Operation(summary = "Lister toutes les personnes")
    public List<Person> findAll() {
        return personService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Trouver une personne par ID")
    public ResponseEntity<Person> findById(@PathVariable UUID id) {
        return personService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Créer une nouvelle personne")
    public ResponseEntity<Person> create(@Valid @RequestBody Person person) {
        Person saved = personService.save(person);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour une personne")
    public ResponseEntity<Person> update(@PathVariable UUID id,
                                         @Valid @RequestBody Person person) {
        Person updated = personService.update(id, person);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une personne")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        personService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}