package com.bizcore.bizcore_backend.repository;

import com.bizcore.bizcore_backend.domain.Developer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeveloperRepository extends JpaRepository<Developer, UUID> {
    Optional<Developer> findByEmail(String email);
    boolean existsByEmail(String email);
}
