package com.bizcore.bizcore_backend.auth;

import com.bizcore.bizcore_backend.domain.AppUser;
import com.bizcore.bizcore_backend.repository.AppUserRepository;
import com.bizcore.bizcore_backend.security.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Inscription, connexion et gestion des rôles")
public class AuthController {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    public AuthController(AppUserRepository appUserRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService,
                          AuthenticationManager authenticationManager,
                          UserDetailsService userDetailsService) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    @PostMapping("/register")
    @Operation(summary = "Créer un nouveau compte — rôle USER par défaut")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest request) {
        if (appUserRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        AppUser user = new AppUser();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());

        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            Set<AppUser.Role> roles = request.getRoles().stream()
                    .map(r -> AppUser.Role.valueOf(r.toUpperCase()))
                    .collect(Collectors.toSet());
            user.setRoles(roles);
        }

        appUserRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        Set<String> roles = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toSet());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(token, user.getEmail(), user.getFullName(), roles));
    }

    @PostMapping("/login")
    @Operation(summary = "Se connecter et obtenir un token JWT")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        AppUser user = appUserRepository.findByEmail(request.getEmail()).orElseThrow();
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        Set<String> roles = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toSet());

        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getFullName(), roles));
    }

    @PatchMapping("/users/{id}/roles")
    @Operation(summary = "Ajouter un rôle à un utilisateur (ADMIN uniquement)")
    public ResponseEntity<Void> addRole(@PathVariable UUID id,
                                        @RequestParam String role) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé : " + id));
        user.addRole(AppUser.Role.valueOf(role.toUpperCase()));
        appUserRepository.save(user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{id}/roles")
    @Operation(summary = "Retirer un rôle d'un utilisateur (ADMIN uniquement)")
    public ResponseEntity<Void> removeRole(@PathVariable UUID id,
                                           @RequestParam String role) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé : " + id));
        user.removeRole(AppUser.Role.valueOf(role.toUpperCase()));
        appUserRepository.save(user);
        return ResponseEntity.ok().build();
    }
}