package com.bizcore.bizcore_backend.security;

import com.bizcore.bizcore_backend.auth.AuthRequest;
import com.bizcore.bizcore_backend.auth.AuthResponse;
import com.bizcore.bizcore_backend.domain.Tenant;
import com.bizcore.bizcore_backend.domain.User;
import com.bizcore.bizcore_backend.repository.TenantRepository;
import com.bizcore.bizcore_backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests de sécurité pour l'authentification et l'autorisation.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Tenant tenant;

    @BeforeEach
    void setUp() {
        // Nettoyer les données
        userRepository.deleteAll();
        tenantRepository.deleteAll();

        // Créer un tenant (id généré par JPA ; on ne force pas l'UUID afin
        // d'éviter un merge sur une ligne inexistante avec @GeneratedValue).
        tenant = new Tenant();
        tenant.setName("Default Tenant");
        tenant.setDomain("Test");
        tenant.setIsActive(true);
        tenantRepository.save(tenant);
    }

    @Test
    void register_shouldCreateNewUser() throws Exception {
        AuthRequest registerRequest = new AuthRequest();
        registerRequest.setEmail("newuser@test.com");
        registerRequest.setPassword("password123");
        registerRequest.setFirstName("New");
        registerRequest.setLastName("User");
        registerRequest.setPhone("+237600000000");
        registerRequest.setCountry("CM");
        registerRequest.setTenantId(tenant.getId().toString());

        String requestContent = objectMapper.writeValueAsString(registerRequest);

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestContent))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.email").value("newuser@test.com"))
                .andExpect(jsonPath("$.firstName").value("New"))
                .andExpect(jsonPath("$.lastName").value("User"));
    }

    @Test
    void register_shouldReturnConflict_forExistingEmail() throws Exception {
        // Créer un utilisateur existant
        User existingUser = new User();
        existingUser.setEmail("existing@test.com");
        existingUser.setPassword(passwordEncoder.encode("password123"));
        existingUser.setFirstName("Existing");
        existingUser.setLastName("User");
        existingUser.setTenant(tenant);
        existingUser.setRoles(Set.of(User.Role.USER));
        userRepository.save(existingUser);

        AuthRequest registerRequest = new AuthRequest();
        registerRequest.setEmail("existing@test.com");
        registerRequest.setPassword("password123");
        registerRequest.setFirstName("Another");
        registerRequest.setLastName("User");

        String requestContent = objectMapper.writeValueAsString(registerRequest);

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestContent))
                .andExpect(status().isConflict());
    }

    @Test
    void login_shouldReturnToken_forValidCredentials() throws Exception {
        // Créer un utilisateur
        User user = new User();
        user.setEmail("loginuser@test.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setFirstName("Login");
        user.setLastName("User");
        user.setTenant(tenant);
        user.setRoles(Set.of(User.Role.USER));
        userRepository.save(user);

        AuthRequest loginRequest = new AuthRequest();
        loginRequest.setEmail("loginuser@test.com");
        loginRequest.setPassword("password123");

        String requestContent = objectMapper.writeValueAsString(loginRequest);

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestContent))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.email").value("loginuser@test.com"));
    }

    @Test
    void login_shouldReturnUnauthorized_forInvalidCredentials() throws Exception {
        // Créer un utilisateur
        User user = new User();
        user.setEmail("testuser@test.com");
        user.setPassword(passwordEncoder.encode("correctpassword"));
        user.setFirstName("Test");
        user.setLastName("User");
        user.setTenant(tenant);
        user.setRoles(Set.of(User.Role.USER));
        userRepository.save(user);

        AuthRequest loginRequest = new AuthRequest();
        loginRequest.setEmail("testuser@test.com");
        loginRequest.setPassword("wrongpassword");

        String requestContent = objectMapper.writeValueAsString(loginRequest);

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestContent))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void securedEndpoint_shouldReturnUnauthorized_withoutToken() throws Exception {
        mockMvc.perform(get("/api/businesses"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void securedEndpoint_shouldReturnForbidden_withInvalidRole() throws Exception {
        // Créer un utilisateur avec rôle USER
        User user = new User();
        user.setEmail("regularuser@test.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setFirstName("Regular");
        user.setLastName("User");
        user.setTenant(tenant);
        user.setRoles(Set.of(User.Role.USER));
        userRepository.save(user);

        // Se connecter
        AuthRequest loginRequest = new AuthRequest();
        loginRequest.setEmail("regularuser@test.com");
        loginRequest.setPassword("password123");

        String loginResponse = mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        AuthResponse authResponse = objectMapper.readValue(loginResponse, AuthResponse.class);
        String token = authResponse.getToken();

        // Tenter d'accéder à une fonctionnalité protégée (création de business)
        // devrait fonctionner car USER a accès
        String businessJson = """
            {
                "name": "Test Business",
                "domain": "Test",
                "description": "Test description",
                "neededEducation": "Test",
                "neededTraining": "Test",
                "tenantId": "%s"
            }
            """.formatted(tenant.getId());

        mockMvc.perform(post("/api/businesses")
                        .with(csrf())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(businessJson))
                .andExpect(status().isCreated());
    }

    @Test
    void register_shouldAssignDefaultUserRole() throws Exception {
        AuthRequest registerRequest = new AuthRequest();
        registerRequest.setEmail("defaultrole@test.com");
        registerRequest.setPassword("password123");
        registerRequest.setFirstName("Default");
        registerRequest.setLastName("Role");
        registerRequest.setTenantId(tenant.getId().toString());

        String requestContent = objectMapper.writeValueAsString(registerRequest);

        String response = mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestContent))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        AuthResponse authResponse = objectMapper.readValue(response, AuthResponse.class);
        
        // Vérifier que l'utilisateur a le rôle USER par défaut
        org.junit.jupiter.api.Assertions.assertTrue(
                authResponse.getRoles().contains("USER"),
                "L'utilisateur devrait avoir le rôle USER par défaut"
        );
    }
}