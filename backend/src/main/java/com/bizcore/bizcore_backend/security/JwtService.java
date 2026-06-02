package com.bizcore.bizcore_backend.security;

import com.bizcore.bizcore_backend.domain.User;
import com.bizcore.bizcore_backend.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    /** Valeur par défaut (dev) livrée dans application.properties / docker-compose : interdite en prod. */
    private static final String DEFAULT_DEV_SECRET =
            "bizcore_secret_key_must_be_at_least_256_bits_long_for_hmac_sha";

    /** HS256 impose une clé d'au moins 256 bits = 32 octets. */
    private static final int MIN_SECRET_BYTES = 32;

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Value("${spring.profiles.active:}")
    private String activeProfiles;

    private final UserRepository userRepository;

    public JwtService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Garde-fou au démarrage : empêche de booter avec une clé JWT trop faible
     * ou avec le secret de développement public en production. Sans ce contrôle,
     * n'importe qui pourrait forger des tokens valides.
     */
    @PostConstruct
    void validateSecret() {
        int length = secretKey == null ? 0 : secretKey.getBytes(StandardCharsets.UTF_8).length;
        if (length < MIN_SECRET_BYTES) {
            throw new IllegalStateException(
                    "jwt.secret trop court (" + length + " octets). HS256 exige au moins "
                            + MIN_SECRET_BYTES + " octets. Définissez la variable d'environnement JWT_SECRET "
                            + "(ex. `openssl rand -base64 48`).");
        }

        boolean isProd = Arrays.asList(activeProfiles.split(",")).contains("prod");
        if (isProd && DEFAULT_DEV_SECRET.equals(secretKey)) {
            throw new IllegalStateException(
                    "JWT_SECRET non défini en production : le secret de développement public est utilisé, "
                            + "ce qui permettrait de forger des tokens. Définissez la variable d'environnement "
                            + "JWT_SECRET (ex. `openssl rand -base64 48`).");
        }
        if (DEFAULT_DEV_SECRET.equals(secretKey)) {
            log.warn("jwt.secret utilise la valeur de développement par défaut. "
                    + "Ne JAMAIS l'utiliser en production — définissez JWT_SECRET.");
        }
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extrait l'UUID du tenant embarqué dans le claim "tenantId".
     * Utilisé par TenantFilter pour alimenter TenantContext.
     */
    public String extractTenantId(String token) {
        return extractClaim(token, claims -> claims.get("tenantId", String.class));
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();
        userRepository.findByEmail(userDetails.getUsername()).ifPresent(user -> {
            // Rôles
            Set<String> roles = user.getRoles().stream()
                    .map(Enum::name)
                    .collect(Collectors.toSet());
            extraClaims.put("roles", roles);

            // Identité
            extraClaims.put("firstName", user.getFirstName());
            extraClaims.put("lastName", user.getLastName());

            // ── Tenant (VLAN d'appartenance) ──────────────────────────────
            // Embarqué dans le JWT pour que TenantFilter n'ait pas besoin
            // d'un appel base supplémentaire à chaque requête.
            if (user.getTenant() != null) {
                extraClaims.put("tenantId", user.getTenant().getId().toString());
                extraClaims.put("tenantName", user.getTenant().getName());
            }
        });
        return generateToken(extraClaims, userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            // Token expiré, signature invalide ou malformé → considéré invalide
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = secretKey.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }
}