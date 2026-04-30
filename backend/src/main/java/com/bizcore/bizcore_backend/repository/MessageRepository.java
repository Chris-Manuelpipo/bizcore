package com.bizcore.bizcore_backend.repository;

import com.bizcore.bizcore_backend.domain.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    @Query("SELECT m FROM Message m WHERE m.serviceRequest.id = :requestId ORDER BY m.createdAt ASC")
    Page<Message> findByServiceRequestId(@Param("requestId") UUID requestId, Pageable pageable);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.serviceRequest.id = :requestId AND m.sender.id != :actorId AND m.read = false")
    long countUnreadByServiceRequestIdAndActorId(@Param("requestId") UUID requestId, @Param("actorId") UUID actorId);

    @Query("UPDATE Message m SET m.read = true WHERE m.serviceRequest.id = :requestId AND m.sender.id != :actorId")
    void markAllAsReadForServiceRequestAndActor(@Param("requestId") UUID requestId, @Param("actorId") UUID actorId);
}