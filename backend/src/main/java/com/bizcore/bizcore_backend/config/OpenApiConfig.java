package com.bizcore.bizcore_backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.tags.Tag;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "BizCore API",
                version = "1.0",
                description = "Business as a Service — API générique de gestion des métiers"
        ),
        security = @SecurityRequirement(name = "bearerAuth")
)
@SecurityScheme(
        name = "bearerAuth",
        description = "JWT token — obtenu via /api/auth/login",
        scheme = "bearer",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {

    private static final List<String> TAG_ORDER = List.of(
            "Authentication", "Users", "Tenants", "Actors", "Businesses",
            "Service Catalogues", "Service Requests", "Invoices",
            "Portfolios", "Business Rules", "Resources", "Media", "Currencies"
    );

    @Bean
    public OpenApiCustomizer tagOrderCustomizer() {
        return openApi -> {
            Map<String, Tag> tagMap = openApi.getTags().stream()
                    .collect(java.util.stream.Collectors.toMap(Tag::getName, t -> t));

            List<Tag> orderedTags = TAG_ORDER.stream()
                    .map(tagMap::get)
                    .filter(t -> t != null)
                    .toList();

            openApi.setTags(orderedTags);
        };
    }
}