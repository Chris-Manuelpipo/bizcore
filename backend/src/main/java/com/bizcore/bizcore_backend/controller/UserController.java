package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.User;
import com.bizcore.bizcore_backend.dto.UserDTO;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Gestion des utilisateurs")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    @Operation(summary = "Lister tous les utilisateurs")
    public Page<UserDTO> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return userRepository.findAll(pageable).map(UserDTO::fromEntity);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Trouver un utilisateur par ID")
    public ResponseEntity<UserDTO> findById(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id.toString()));
        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Trouver un utilisateur par email")
    public ResponseEntity<UserDTO> findByEmail(@PathVariable String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email=" + email));
        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }
}
