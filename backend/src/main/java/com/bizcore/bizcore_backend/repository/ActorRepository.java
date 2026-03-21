package com.bizcore.bizcore_backend.repository;

import com.bizcore.bizcore_backend.domain.Actor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ActorRepository extends JpaRepository<Actor, UUID> {
    List<Actor> findByPersonId(UUID personId);
    List<Actor> findByRole(String role);
    List<Actor> findByIsActive(Boolean isActive);
}