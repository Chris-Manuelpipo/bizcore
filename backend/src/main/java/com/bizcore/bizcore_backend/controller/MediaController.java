package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.Media;
import com.bizcore.bizcore_backend.dto.MediaDTO;
import com.bizcore.bizcore_backend.service.MediaService;
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
@RequestMapping("/api/media")
@Tag(name = "Media", description = "Gestion des médias illustrant les métiers")
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping
    @Operation(summary = "Lister tous les médias")
    public List<MediaDTO> findAll() {
        return mediaService.findAll().stream()
                .map(MediaDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Trouver un média par ID")
    public ResponseEntity<MediaDTO> findById(@PathVariable UUID id) {
        return mediaService.findById(id)
                .map(MediaDTO::fromEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/business/{businessId}")
    @Operation(summary = "Lister les médias d'un métier")
    public List<MediaDTO> findByBusiness(@PathVariable UUID businessId) {
        return mediaService.findByBusinessId(businessId).stream()
                .map(MediaDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Lister les médias par type")
    public List<MediaDTO> findByType(@PathVariable String type) {
        return mediaService.findByType(type).stream()
                .map(MediaDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @PostMapping("/business/{businessId}")
    @Operation(summary = "Ajouter un média à un métier")
    public ResponseEntity<MediaDTO> create(@PathVariable UUID businessId,
                                           @Valid @RequestBody MediaDTO dto) {
        Media media = dto.toEntity();
        Media saved = mediaService.save(businessId, media);
        return ResponseEntity.status(HttpStatus.CREATED).body(MediaDTO.fromEntity(saved));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un média")
    public ResponseEntity<MediaDTO> update(@PathVariable UUID id,
                                           @Valid @RequestBody MediaDTO dto) {
        Media updated = mediaService.update(id, dto.toEntity());
        return ResponseEntity.ok(MediaDTO.fromEntity(updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un média")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        mediaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
