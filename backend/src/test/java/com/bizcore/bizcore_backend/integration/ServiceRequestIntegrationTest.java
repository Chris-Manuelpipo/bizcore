package com.bizcore.bizcore_backend.integration;

import com.bizcore.bizcore_backend.auth.AuthResponse;
import com.bizcore.bizcore_backend.domain.*;
import com.bizcore.bizcore_backend.dto.ServiceRequestDTO;
import com.bizcore.bizcore_backend.repository.*;
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

import java.math.BigDecimal;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'intégration pour le flux complet ServiceRequest.
 * Ces tests nécessitent une base de données de test (H2 en mémoire).
 * 
 * Pour exécuter ces tests, ajoutez la dépendance H2 dans pom.xml:
 * <dependency>
 *     <groupId>com.h2database</groupId>
 *     <artifactId>h2</artifactId>
 *     <scope>test</scope>
 * </dependency>
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ServiceRequestIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActorRepository actorRepository;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private ServiceCatalogueRepository serviceCatalogueRepository;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Tenant tenant;
    private User consumerUser;
    private User providerUser;
    private Actor consumer;
    private Actor provider;
    private Business business;
    private ServiceCatalogue catalogue;
    private String authToken;

    @BeforeEach
    void setUp() throws Exception {
        // Nettoyer les données
        serviceRequestRepository.deleteAll();
        serviceCatalogueRepository.deleteAll();
        actorRepository.deleteAll();
        businessRepository.deleteAll();
        userRepository.deleteAll();
        tenantRepository.deleteAll();

        // Créer un tenant
        tenant = new Tenant();
        tenant.setName("Test Tenant");
        tenant.setDomain("Test Domain");
        tenant.setIsActive(true);
        tenantRepository.save(tenant);

        // Créer un utilisateur consumer
        consumerUser = new User();
        consumerUser.setEmail("consumer@test.com");
        consumerUser.setPassword(passwordEncoder.encode("password123"));
        consumerUser.setFirstName("John");
        consumerUser.setLastName("Doe");
        consumerUser.setTenant(tenant);
        consumerUser.setRoles(java.util.Set.of(User.Role.USER));
        userRepository.save(consumerUser);

        // Créer un utilisateur provider
        providerUser = new User();
        providerUser.setEmail("provider@test.com");
        providerUser.setPassword(passwordEncoder.encode("password123"));
        providerUser.setFirstName("Jane");
        providerUser.setLastName("Smith");
        providerUser.setTenant(tenant);
        providerUser.setRoles(java.util.Set.of(User.Role.USER));
        userRepository.save(providerUser);

        // Créer des actors
        consumer = new Actor();
        consumer.setRole("CONSUMER");
        consumer.setBio("Consumer bio");
        consumer.setUser(consumerUser);
        actorRepository.save(consumer);

        provider = new Actor();
        provider.setRole("PROVIDER");
        provider.setBio("Provider bio");
        provider.setUser(providerUser);
        actorRepository.save(provider);

        // Créer un business
        business = new Business();
        business.setName("Pharmacien");
        business.setDomain("Santé");
        business.setDescription("Healthcare business");
        business.setNeededEducation("Doctorat");
        business.setNeededTraining("Stage");
        businessRepository.save(business);

        // Créer un catalogue de services
        catalogue = new ServiceCatalogue();
        catalogue.setName("Consultation pharmacien");
        catalogue.setDescription("Consultation sur les médicaments");
        catalogue.setBasePrice(new BigDecimal("5000.00"));
        catalogue.setCurrency("XAF");
        catalogue.setIsAvailable(true);
        catalogue.setBusiness(business);
        serviceCatalogueRepository.save(catalogue);

        // Se connecter pour obtenir un token
        String loginRequest = """
            {
                "email": "consumer@test.com",
                "password": "password123"
            }
            """;

        String response = mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginRequest))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        AuthResponse authResponse = objectMapper.readValue(response, AuthResponse.class);
        authToken = authResponse.getToken();
    }

    @Test
    void createServiceRequest_shouldSucceed() throws Exception {
        ServiceRequestDTO requestDTO = new ServiceRequestDTO();
        requestDTO.setServiceName("Demande de consultation");

        String requestContent = objectMapper.writeValueAsString(requestDTO);

        mockMvc.perform(post("/api/service-requests/consumer/{consumerId}/provider/{providerId}/catalogue/{catalogueId}",
                        consumer.getId(), provider.getId(), catalogue.getId())
                        .with(csrf())
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestContent))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.serviceName").value("Demande de consultation"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void getServiceRequests_shouldReturnPagedList() throws Exception {
        // Créer une demande de service
        ServiceRequest sr = new ServiceRequest();
        sr.setConsumer(consumer);
        sr.setProvider(provider);
        sr.setServiceCatalogue(catalogue);
        sr.setStatus(ServiceRequest.Status.PENDING);
        sr.setServiceName("Existing Request");
        sr.setTenant(tenant);
        serviceRequestRepository.save(sr);

        mockMvc.perform(get("/api/service-requests")
                        .with(csrf())
                        .header("Authorization", "Bearer " + authToken)
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void acceptServiceRequest_shouldTransitionToAccepted() throws Exception {
        // Créer une demande de service
        ServiceRequest sr = new ServiceRequest();
        sr.setConsumer(consumer);
        sr.setProvider(provider);
        sr.setServiceCatalogue(catalogue);
        sr.setStatus(ServiceRequest.Status.PENDING);
        sr.setServiceName("Request to Accept");
        sr.setTenant(tenant);
        serviceRequestRepository.save(sr);

        mockMvc.perform(put("/api/service-requests/{id}/accept", sr.getId())
                        .with(csrf())
                        .header("Authorization", "Bearer " + authToken)
                        .param("actorId", provider.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));
    }

    @Test
    void cancelServiceRequest_shouldTransitionToCancelled() throws Exception {
        // Créer une demande de service
        ServiceRequest sr = new ServiceRequest();
        sr.setConsumer(consumer);
        sr.setProvider(provider);
        sr.setServiceCatalogue(catalogue);
        sr.setStatus(ServiceRequest.Status.PENDING);
        sr.setServiceName("Request to Cancel");
        sr.setTenant(tenant);
        serviceRequestRepository.save(sr);

        mockMvc.perform(put("/api/service-requests/{id}/cancel", sr.getId())
                        .with(csrf())
                        .header("Authorization", "Bearer " + authToken)
                        .param("actorId", consumer.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }
}