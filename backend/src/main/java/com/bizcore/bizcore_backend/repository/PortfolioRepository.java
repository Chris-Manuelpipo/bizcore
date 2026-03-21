package com.bizcore.bizcore_backend.repository;

import com.bizcore.bizcore_backend.domain.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, UUID> {
    Optional<Portfolio> findByActorId(UUID actorId);
    boolean existsByActorId(UUID actorId);
}