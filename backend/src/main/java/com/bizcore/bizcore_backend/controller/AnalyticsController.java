package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.service.AnalyticsService;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Analytics", description = "Métriques & KPIs métiers")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/tenants/{tenantId}/kpis")
    public ResponseEntity<AnalyticsService.KPIs> getTenantKPIs(
            @Parameter(description = "ID du tenant")
            @PathVariable UUID tenantId,
            @Parameter(description = "Début de la période (ISO 8601)")
            @RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @Parameter(description = "Fin de la période (ISO 8601)")
            @RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        
        AnalyticsService.KPIs kpis = analyticsService.calculateTenantKPIs(tenantId, from, to);
        return ResponseEntity.ok(kpis);
    }
}