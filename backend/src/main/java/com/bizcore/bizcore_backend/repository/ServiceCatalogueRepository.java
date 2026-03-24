package com.bizcore.bizcore_backend.repository;

import com.bizcore.bizcore_backend.domain.ServiceCatalogue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ServiceCatalogueRepository extends JpaRepository<ServiceCatalogue, UUID> {
    List<ServiceCatalogue> findByBusinessId(UUID businessId);
    List<ServiceCatalogue> findByIsAvailable(Boolean isAvailable);
    List<ServiceCatalogue> findByNameContainingIgnoreCase(String name);
    
    /**
     * Find a service catalogue by business and name.
     * Returns the first available matching service if multiple exist.
     */
    Optional<ServiceCatalogue> findFirstByBusinessIdAndName(UUID businessId, String name);
}