package com.bizcore.bizcore_backend.repository;

import com.bizcore.bizcore_backend.domain.AuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, UUID> {

    @Query("SELECT a FROM AuditEvent a WHERE a.entityType = 'SERVICE_REQUEST' AND a.entityId = :serviceRequestId ORDER BY a.timestamp ASC")
    List<AuditEvent> findAllForServiceRequest(@Param("serviceRequestId") UUID serviceRequestId);

    @Query("SELECT a FROM AuditEvent a WHERE a.actorId = :actorId ORDER BY a.timestamp DESC")
    List<AuditEvent> findAllForActor(@Param("actorId") UUID actorId);

    @Query("SELECT a FROM AuditEvent a WHERE a.traceId = :traceId ORDER BY a.timestamp ASC")
    List<AuditEvent> findAllByTraceId(@Param("traceId") UUID traceId);

    @Query("SELECT a FROM AuditEvent a WHERE a.tenantId = :tenantId ORDER BY a.timestamp DESC")
    List<AuditEvent> findAllForTenant(@Param("tenantId") UUID tenantId);
}