package com.bizcore.bizcore_backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * TenantFilter — Analogie réseau : lecture de l'en-tête VLAN sur chaque paquet.
 *
 * S'exécute APRÈS JwtAuthFilter (Order 2). Extrait l'UUID du tenant depuis
 * le claim "tenantId" du JWT déjà validé, puis l'injecte dans TenantContext
 * pour que tous les services appelés dans cette requête travaillent
 * exclusivement sur les données du bon tenant.
 *
 * Le bloc finally garantit que TenantContext est TOUJOURS nettoyé,
 * même en cas d'exception, évitant toute fuite vers la requête suivante.
 */
@Component
@Order(2)
public class TenantFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(TenantFilter.class);

    private final JwtService jwtService;

    public TenantFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        try {
            final String authHeader = request.getHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                final String jwt = authHeader.substring(7);
                try {
                    String tenantIdStr = jwtService.extractTenantId(jwt);
                    if (tenantIdStr != null && !tenantIdStr.isBlank()) {
                        TenantContext.setTenantId(UUID.fromString(tenantIdStr));
                        log.debug("TenantContext défini : {}", tenantIdStr);
                    }
                } catch (Exception e) {
                    // Token expiré ou malformé — JwtAuthFilter gérera le rejet.
                    // On laisse passer sans tenant context.
                    log.debug("Impossible d'extraire le tenantId du JWT : {}", e.getMessage());
                }
            }

            filterChain.doFilter(request, response);

        } finally {
            // CRITIQUE : toujours libérer le ThreadLocal en fin de requête.
            TenantContext.clear();
        }
    }
}
