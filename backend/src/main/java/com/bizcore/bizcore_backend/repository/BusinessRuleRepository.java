package com.bizcore.bizcore_backend.repository;

import com.bizcore.bizcore_backend.domain.BusinessRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BusinessRuleRepository extends JpaRepository<BusinessRule, UUID> {
    List<BusinessRule> findByBusinessId(UUID businessId);
    Optional<BusinessRule> findByBusinessIdAndRuleKey(UUID businessId, String ruleKey);
}