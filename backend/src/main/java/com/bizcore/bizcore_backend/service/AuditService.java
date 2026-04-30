package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.AuditEvent;
import com.bizcore.bizcore_backend.domain.ServiceRequest;
import com.bizcore.bizcore_backend.repository.AuditEventRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AuditEventRepository auditEventRepository;
    private final HttpServletRequest request;

    public AuditService(AuditEventRepository auditEventRepository, HttpServletRequest request) {
        this.auditEventRepository = auditEventRepository;
        this.request = request;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logServiceRequestStatusChange(ServiceRequest serviceRequest, ServiceRequest.Status oldStatus, UUID actorId) {
        AuditEvent event = new AuditEvent();
        event.setTenantId(serviceRequest.getTenant().getId());
        event.setTraceId(serviceRequest.getTraceId());
        event.setActorId(actorId);
        event.setEntityType(AuditEvent.EntityType.SERVICE_REQUEST);
        event.setEntityId(serviceRequest.getId());
        event.setAction(AuditEvent.Action.STATUS_CHANGED);
        event.setPreviousStatus(oldStatus);
        event.setNewStatus(serviceRequest.getStatus());
        
        // Ajouter les informations de la requête HTTP
        event.setIpAddress(request.getRemoteAddr());
        event.setUserAgent(request.getHeader("User-Agent"));

        auditEventRepository.save(event);
        
        log.info("Audit logged: ServiceRequest {} changed from {} to {} by actor {}", 
            serviceRequest.getId(), oldStatus, serviceRequest.getStatus(), actorId);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logServiceRequestCreated(ServiceRequest serviceRequest, UUID actorId) {
        AuditEvent event = new AuditEvent();
        event.setTenantId(serviceRequest.getTenant().getId());
        event.setTraceId(serviceRequest.getTraceId());
        event.setActorId(actorId);
        event.setEntityType(AuditEvent.EntityType.SERVICE_REQUEST);
        event.setEntityId(serviceRequest.getId());
        event.setAction(AuditEvent.Action.CREATED);
        event.setNewStatus(serviceRequest.getStatus());
        event.setIpAddress(request.getRemoteAddr());
        event.setUserAgent(request.getHeader("User-Agent"));

        auditEventRepository.save(event);
        
        log.info("Audit logged: ServiceRequest {} created by actor {}", serviceRequest.getId(), actorId);
    }

    public List<AuditEvent> getAuditForServiceRequest(UUID serviceRequestId) {
        return auditEventRepository.findAllForServiceRequest(serviceRequestId);
    }

    public List<AuditEvent> getAuditForActor(UUID actorId) {
        return auditEventRepository.findAllForActor(actorId);
    }

    public List<AuditEvent> getAuditByTraceId(UUID traceId) {
        return auditEventRepository.findAllByTraceId(traceId);
    }

    public List<AuditEvent> getAuditForTenant(UUID tenantId) {
        return auditEventRepository.findAllForTenant(tenantId);
    }
}