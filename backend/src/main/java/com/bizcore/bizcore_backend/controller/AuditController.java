package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.AuditEvent;
import com.bizcore.bizcore_backend.service.AuditService;

import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/audit")
@Tag(name = "Audit tail", description = "Piste d'audit immuable pour la traçabilité")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping("/service-requests/{servicerequestId}")
    public ResponseEntity<List<AuditEvent>> getAuditForServiceRequest(@PathVariable UUID servicerequestid) {
        List<AuditEvent> events = auditService.getAuditForServiceRequest(servicerequestid);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/actors/{actorId}")
    public ResponseEntity<List<AuditEvent>> getAuditForActor(@PathVariable UUID actorid) {
        List<AuditEvent> events = auditService.getAuditForActor(actorid);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/trace/{traceId}")
    public ResponseEntity<List<AuditEvent>> getAuditByTraceId(@PathVariable UUID traceId) {
        List<AuditEvent> events = auditService.getAuditByTraceId(traceId);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/tenants/{tenantId}")
    public ResponseEntity<List<AuditEvent>> getAuditForTenant(@PathVariable UUID tenantid) {
        List<AuditEvent> events = auditService.getAuditForTenant(tenantid);
        return ResponseEntity.ok(events);
    }
}