package com.bizcore.bizcore_backend.security;

import com.bizcore.bizcore_backend.domain.ApiKey;
import com.bizcore.bizcore_backend.repository.ApiKeyRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;

/**
 * Authentifie les requêtes portant une clé API BizCore (préfixe bcs_live_).
 * Définit le TenantContext à partir du tenant lié à la clé.
 */
@Component
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private final ApiKeyRepository apiKeyRepository;

    public ApiKeyAuthFilter(ApiKeyRepository apiKeyRepository) {
        this.apiKeyRepository = apiKeyRepository;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        String rawKey = resolveApiKey(request);
        if (rawKey != null && ApiKeyHasher.isApiKey(rawKey)) {
            authenticateApiKey(rawKey);
        }

        filterChain.doFilter(request, response);
    }

    private String resolveApiKey(HttpServletRequest request) {
        String apiKeyHeader = request.getHeader("X-Api-Key");
        if (apiKeyHeader != null && !apiKeyHeader.isBlank()) {
            return apiKeyHeader.trim();
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            if (ApiKeyHasher.isApiKey(token)) {
                return token;
            }
        }
        return null;
    }

    private void authenticateApiKey(String rawKey) {
        String prefix = ApiKeyHasher.extractLookupPrefix(rawKey);
        apiKeyRepository.findActiveWithRelationsByKeyPrefix(prefix).ifPresent(apiKey -> {
            if (!ApiKeyHasher.matches(rawKey, apiKey.getKeyHash())) return;
            if (apiKey.isExpired()) return;
            if (!Boolean.TRUE.equals(apiKey.getIsActive())) return;
            if (apiKey.getTenant() == null || !Boolean.TRUE.equals(apiKey.getTenant().getIsActive())) return;

            apiKey.setLastUsedAt(LocalDateTime.now());
            apiKeyRepository.save(apiKey);

            TenantContext.setTenantId(apiKey.getTenant().getId());

            ApiKeyPrincipal principal = new ApiKeyPrincipal(
                    apiKey.getId(),
                    apiKey.getDeveloper().getId(),
                    apiKey.getTenant().getId(),
                    apiKey.getKeyPrefix()
            );

            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    principal, null, principal.getAuthorities()
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
        });
    }
}
