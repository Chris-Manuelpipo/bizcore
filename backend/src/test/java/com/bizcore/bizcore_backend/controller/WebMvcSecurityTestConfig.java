package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.security.JwtAuthFilter;
import com.bizcore.bizcore_backend.security.JwtService;
import com.bizcore.bizcore_backend.security.TenantFilter;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.userdetails.UserDetailsService;

/**
 * Fournit les collaborateurs de sécurité absents du slice {@code @WebMvcTest}.
 *
 * <p>{@link JwtService} et {@link UserDetailsService} sont mockés (jamais
 * sollicités sans en-tête {@code Authorization}), tandis que les vrais
 * {@link JwtAuthFilter} et {@link TenantFilter} sont fournis pour que la chaîne
 * de filtres définie dans {@code SecurityConfig} se construise et reste
 * traversante : sans token, les deux filtres se contentent d'appeler
 * {@code chain.doFilter}, laissant {@code @WithMockUser} authentifier la requête.
 */
@TestConfiguration
public class WebMvcSecurityTestConfig {

    @Bean
    JwtService jwtService() {
        return Mockito.mock(JwtService.class);
    }

    @Bean
    UserDetailsService userDetailsService() {
        return Mockito.mock(UserDetailsService.class);
    }

    @Bean
    JwtAuthFilter jwtAuthFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        return new JwtAuthFilter(jwtService, userDetailsService);
    }

    @Bean
    TenantFilter tenantFilter(JwtService jwtService) {
        return new TenantFilter(jwtService);
    }
}
