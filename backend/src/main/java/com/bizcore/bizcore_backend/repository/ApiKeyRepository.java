package com.bizcore.bizcore_backend.repository;

import com.bizcore.bizcore_backend.domain.ApiKey;
import com.bizcore.bizcore_backend.domain.Developer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, UUID> {
    List<ApiKey> findByDeveloperAndIsActiveTrueOrderByCreatedAtDesc(Developer developer);

  List<ApiKey> findByDeveloperOrderByCreatedAtDesc(Developer developer);

    @Query("SELECT k FROM ApiKey k JOIN FETCH k.developer JOIN FETCH k.tenant "
            + "WHERE k.keyPrefix = :prefix AND k.isActive = true")
    Optional<ApiKey> findActiveWithRelationsByKeyPrefix(@Param("prefix") String prefix);

    Optional<ApiKey> findByIdAndDeveloper(UUID id, Developer developer);
}
