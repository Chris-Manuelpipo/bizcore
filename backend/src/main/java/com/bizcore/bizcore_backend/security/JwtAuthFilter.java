package com.bizcore.bizcore_backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final UserDetailsService developerDetailsService;

    public JwtAuthFilter(JwtService jwtService,
                         @Qualifier("userDetailsService") UserDetailsService userDetailsService,
                         @Qualifier("developerDetailsService") UserDetailsService developerDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.developerDetailsService = developerDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        if (ApiKeyHasher.isApiKey(jwt)) {
            filterChain.doFilter(request, response);
            return;
        }

        final String userEmail;
        try {
            userEmail = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            // Token malformé, signature invalide ou expiré : on ne pose pas
            // d'authentification. L'AuthenticationEntryPoint renverra un 401
            // propre sur les endpoints protégés (au lieu d'un 500).
            filterChain.doFilter(request, response);
            return;
        }

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails;
            try {
                String principalType = jwtService.extractPrincipalType(jwt);
                if ("DEVELOPER".equals(principalType)) {
                    userDetails = developerDetailsService.loadUserByUsername(userEmail);
                } else {
                    userDetails = userDetailsService.loadUserByUsername(userEmail);
                }
            } catch (Exception e) {
                userDetails = userDetailsService.loadUserByUsername(userEmail);
            }

            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}