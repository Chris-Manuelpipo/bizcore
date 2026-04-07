package com.bizcore.bizcore_backend.repository;

import com.bizcore.bizcore_backend.domain.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface MediaRepository extends JpaRepository<Media, UUID> {
    List<Media> findByBusinessId(UUID businessId);
    List<Media> findByType(String type);
}
