package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.service.AnalyticsService;

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
            @PathVariable UUID tenantid,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        
        AnalyticsService.KPIs kpis = analyticsService.calculateTenantKPIs(tenantid, from, to);
        return ResponseEntity.ok(kpis);
    }
}