package com.bizcore.bizcore_backend.repository;

import com.bizcore.bizcore_backend.domain.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, UUID> {
    List<Resource> findByBusinessId(UUID businessId);
    List<Resource> findByType(String type);
}