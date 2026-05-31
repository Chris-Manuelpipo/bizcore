package com.bizcore.bizcore_backend.auth;

import com.bizcore.bizcore_backend.domain.User;
import com.bizcore.bizcore_backend.domain.Tenant;
import com.bizcore.bizcore_backend.repository.UserRepository;
import com.bizcore.bizcore_backend.repository.TenantRepository;
import com.bizcore.bizcore_backend.security.JwtService;
import com.bizcore.bizcore_backend.security.UserDetailsServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Inscription, connexion et gestion des rôles")
public class AuthController {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;

    public AuthController(UserRepository userRepository,
                          TenantRepository tenantRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService,
                          AuthenticationManager authenticationManager,
                          UserDetailsServiceImpl userDetailsService) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    @PostMapping("/register")
    @Operation(summary = "Créer un nouveau compte — rôle USER par défaut")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        Tenant tenant;
        if (request.getTenantId() != null && !request.getTenantId().isBlank()) {
            tenant = tenantRepository.findById(UUID.fromString(request.getTenantId()))
                    .orElseThrow(() -> new RuntimeException("Tenant introuvable : " + request.getTenantId()));
        } else {
            tenant = tenantRepository.findById(UUID.fromString("00000000-0000-0000-0000-000000000001"))
                    .orElseThrow(() -> new RuntimeException("Tenant par défaut introuvable. Exécutez la migration 020."));
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setCountry(request.getCountry());
        user.setTenant(tenant);

        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            Set<User.Role> roles = request.getRoles().stream()
                    .map(r -> User.Role.valueOf(r.toUpperCase()))
                    .collect(Collectors.toSet());
            user.setRoles(roles);
        }

        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        Set<String> roles = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toSet());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(token, user.getEmail(), user.getFirstName(), user.getLastName(), roles));
    }

    @PostMapping("/login")
    @Operation(summary = "Se connecter et obtenir un token JWT")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        // Pas de @Valid : la connexion ne requiert qu'email + password.
        // (firstName/lastName de AuthRequest ne concernent que l'inscription.)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        Set<String> roles = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toSet());

        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getFirstName(), user.getLastName(), roles));
    }

    @PatchMapping("/users/{id}/roles")
    @Operation(summary = "Ajouter un rôle à un utilisateur (ADMIN uniquement)")
    public ResponseEntity<Void> addRole(@PathVariable UUID id,
                                        @RequestParam String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé : " + id));
        user.addRole(User.Role.valueOf(role.toUpperCase()));
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{id}/roles")
    @Operation(summary = "Retirer un rôle d'un utilisateur (ADMIN uniquement)")
    public ResponseEntity<Void> removeRole(@PathVariable UUID id,
                                           @RequestParam String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé : " + id));
        user.removeRole(User.Role.valueOf(role.toUpperCase()));
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }
}
