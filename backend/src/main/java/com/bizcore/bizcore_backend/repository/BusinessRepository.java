package com.bizcore.bizcore_backend.repository;

import com.bizcore.bizcore_backend.domain.Business;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface BusinessRepository extends JpaRepository<Business, UUID> {
    List<Business> findByDomain(String domain);
    List<Business> findByNameContainingIgnoreCase(String name);
}