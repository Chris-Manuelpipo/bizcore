package com.bizcore.bizcore_backend.auth;

import com.bizcore.bizcore_backend.domain.Developer;
import com.bizcore.bizcore_backend.dto.DeveloperAuthRequest;
import com.bizcore.bizcore_backend.dto.DeveloperAuthResponse;
import com.bizcore.bizcore_backend.dto.DeveloperLoginRequest;
import com.bizcore.bizcore_backend.repository.DeveloperRepository;
import com.bizcore.bizcore_backend.security.DeveloperDetailsServiceImpl;
import com.bizcore.bizcore_backend.security.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dev-auth")
@Tag(name = "Developer Auth", description = """
        Inscription et connexion des développeurs BCaaS.

        Utilisez ces endpoints pour renseigner les informations du développeur \
        (prénom, nom, email, mot de passe), puis le JWT retourné pour le Developer Portal.
        """)
@SecurityRequirements
public class DeveloperAuthController {

    private final DeveloperRepository developerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final DeveloperDetailsServiceImpl developerDetailsService;

    public DeveloperAuthController(DeveloperRepository developerRepository,
                                   PasswordEncoder passwordEncoder,
                                   JwtService jwtService,
                                   AuthenticationManager authenticationManager,
                                   DeveloperDetailsServiceImpl developerDetailsService) {
        this.developerRepository = developerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.developerDetailsService = developerDetailsService;
    }

    @PostMapping("/register")
    @Operation(
            summary = "Créer un compte développeur",
            description = "Enregistre prénom, nom, email et mot de passe. Retourne un JWT portail.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(schema = @Schema(implementation = DeveloperAuthRequest.class))
            ),
            responses = {
                    @ApiResponse(responseCode = "201", description = "Compte créé"),
                    @ApiResponse(responseCode = "409", description = "Email déjà utilisé")
            }
    )
    public ResponseEntity<DeveloperAuthResponse> register(@Valid @RequestBody DeveloperAuthRequest request) {
        if (developerRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        Developer developer = new Developer();
        developer.setFirstName(request.getFirstName());
        developer.setLastName(request.getLastName());
        developer.setEmail(request.getEmail());
        developer.setPassword(passwordEncoder.encode(request.getPassword()));
        developerRepository.save(developer);

        String token = jwtService.generateDeveloperToken(developer);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new DeveloperAuthResponse(
                        token, developer.getEmail(), developer.getFirstName(), developer.getLastName()));
    }

    @PostMapping("/login")
    @Operation(
            summary = "Connexion développeur — retourne un JWT portail",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(schema = @Schema(implementation = DeveloperLoginRequest.class))
            )
    )
    public ResponseEntity<DeveloperAuthResponse> login(@Valid @RequestBody DeveloperLoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        Developer developer = developerDetailsService.loadDeveloperByEmail(request.getEmail());
        String token = jwtService.generateDeveloperToken(developer);

        return ResponseEntity.ok(new DeveloperAuthResponse(
                token, developer.getEmail(), developer.getFirstName(), developer.getLastName()));
    }
}
