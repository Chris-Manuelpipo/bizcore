package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Business;
import com.bizcore.bizcore_backend.domain.BusinessRule;
import com.bizcore.bizcore_backend.repository.BusinessRepository;
import com.bizcore.bizcore_backend.repository.BusinessRuleRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BusinessRuleService {

    private final BusinessRuleRepository businessRuleRepository;
    private final BusinessRepository businessRepository;

    public BusinessRuleService(BusinessRuleRepository businessRuleRepository,
                               BusinessRepository businessRepository) {
        this.businessRuleRepository = businessRuleRepository;
        this.businessRepository = businessRepository;
    }

    public List<BusinessRule> findAll() {
        return businessRuleRepository.findAll();
    }

    public Optional<BusinessRule> findById(UUID id) {
        return businessRuleRepository.findById(id);
    }

    public List<BusinessRule> findByBusinessId(UUID businessId) {
        return businessRuleRepository.findByBusinessId(businessId);
    }

    public BusinessRule save(UUID businessId, BusinessRule rule) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Métier non trouvé : " + businessId));
        rule.setBusiness(business);
        return businessRuleRepository.save(rule);
    }

    public BusinessRule update(UUID id, BusinessRule updated) {
        BusinessRule existing = businessRuleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Règle non trouvée : " + id));
        existing.setRuleKey(updated.getRuleKey());
        existing.setRuleValue(updated.getRuleValue());
        existing.setDescription(updated.getDescription());
        return businessRuleRepository.save(existing);
    }

    public void deleteById(UUID id) {
        businessRuleRepository.deleteById(id);
    }
}