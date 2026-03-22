package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.Person;
import com.bizcore.bizcore_backend.dto.PersonDTO;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.service.PersonService;
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
    @Operation(summary = "Lister toutes les personnes avec pagination")
    public Page<PersonDTO> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());
        return personService.findAll(pageable).map(PersonDTO::fromEntity);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Trouver une personne par ID")
    public ResponseEntity<PersonDTO> findById(@PathVariable UUID id) {
        Person person = personService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Person", id.toString()));
        return ResponseEntity.ok(PersonDTO.fromEntity(person));
    }

    @PostMapping
    @Operation(summary = "Créer une nouvelle personne")
    public ResponseEntity<PersonDTO> create(@Valid @RequestBody PersonDTO dto) {
        Person saved = personService.save(dto.toEntity());
        return ResponseEntity.status(HttpStatus.CREATED).body(PersonDTO.fromEntity(saved));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour une personne")
    public ResponseEntity<PersonDTO> update(@PathVariable UUID id,
                                            @Valid @RequestBody PersonDTO dto) {
        Person updated = personService.update(id, dto.toEntity());
        return ResponseEntity.ok(PersonDTO.fromEntity(updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une personne")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        personService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}