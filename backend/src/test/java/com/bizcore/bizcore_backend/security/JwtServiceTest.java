package com.bizcore.bizcore_backend.security;

import com.bizcore.bizcore_backend.domain.User;
import com.bizcore.bizcore_backend.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private JwtService jwtService;

    private User testUser;
    private UserDetails userDetails;
    private String testSecretKey = "test_secret_key_that_is_at_least_256_bits_long_for_testing_purposes";
    private long testExpiration = 3600000L; // 1 hour

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtService, "secretKey", testSecretKey);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", testExpiration);

        testUser = new User();
        testUser.setId(java.util.UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setRoles(Set.of(User.Role.USER));

        com.bizcore.bizcore_backend.domain.Tenant tenant = new com.bizcore.bizcore_backend.domain.Tenant();
        tenant.setId(java.util.UUID.randomUUID());
        tenant.setName("Test Tenant");
        testUser.setTenant(tenant);

        userDetails = org.springframework.security.core.userdetails.User
                .withUsername("test@example.com")
                .password("password")
                .roles("USER")
                .build();
    }

    @Test
    void generateToken_shouldCreateValidToken() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        String token = jwtService.generateToken(userDetails);

        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    @Test
    void generateToken_shouldIncludeUserClaims() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        String token = jwtService.generateToken(userDetails);

        Claims claims = extractAllClaims(token);
        assertEquals("test@example.com", claims.getSubject());
        assertEquals("John", claims.get("firstName"));
        assertEquals("Doe", claims.get("lastName"));
        assertTrue(claims.get("tenantId") instanceof String);
        assertEquals("Test Tenant", claims.get("tenantName"));
    }

    @Test
    void extractUsername_shouldReturnEmail() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        String token = jwtService.generateToken(userDetails);
        String username = jwtService.extractUsername(token);

        assertEquals("test@example.com", username);
    }

    @Test
    void extractTenantId_shouldReturnTenantId() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        String token = jwtService.generateToken(userDetails);
        String tenantId = jwtService.extractTenantId(token);

        assertNotNull(tenantId);
        assertEquals(testUser.getTenant().getId().toString(), tenantId);
    }

    @Test
    void isTokenValid_shouldReturnTrue_forValidToken() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        String token = jwtService.generateToken(userDetails);

        boolean isValid = jwtService.isTokenValid(token, userDetails);

        assertTrue(isValid);
    }

    @Test
    void isTokenValid_shouldReturnFalse_forExpiredToken() {
        // Create an expired token manually
        Date now = new Date();
        Date expiration = new Date(now.getTime() - 1000); // 1 second in the past

        SecretKey key = Keys.hmacShaKeyFor(testSecretKey.getBytes());
        String expiredToken = Jwts.builder()
                .subject("test@example.com")
                .issuedAt(now)
                .expiration(expiration)
                .signWith(key)
                .compact();

        boolean isValid = jwtService.isTokenValid(expiredToken, userDetails);

        assertFalse(isValid);
    }

    @Test
    void isTokenValid_shouldReturnFalse_forDifferentUser() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        String token = jwtService.generateToken(userDetails);

        UserDetails differentUser = org.springframework.security.core.userdetails.User
                .withUsername("different@example.com")
                .password("password")
                .roles("USER")
                .build();

        boolean isValid = jwtService.isTokenValid(token, differentUser);

        assertFalse(isValid);
    }

    @Test
    void extractClaim_shouldReturnCorrectValue() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        String token = jwtService.generateToken(userDetails);

        String firstName = jwtService.extractClaim(token, claims -> claims.get("firstName", String.class));

        assertEquals("John", firstName);
    }

    private Claims extractAllClaims(String token) {
        SecretKey key = Keys.hmacShaKeyFor(testSecretKey.getBytes());
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}