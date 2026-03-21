package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Business;
import com.bizcore.bizcore_backend.repository.BusinessRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BusinessService {

    private final BusinessRepository businessRepository;

    public BusinessService(BusinessRepository businessRepository) {
        this.businessRepository = businessRepository;
    }

    public List<Business> findAll() {
        return businessRepository.findAll();
    }

    public Optional<Business> findById(UUID id) {
        return businessRepository.findById(id);
    }

    public List<Business> findByDomain(String domain) {
        return businessRepository.findByDomain(domain);
    }

    public List<Business> search(String name) {
        return businessRepository.findByNameContainingIgnoreCase(name);
    }

    public Business save(Business business) {
        return businessRepository.save(business);
    }

    public Business update(UUID id, Business updated) {
        Business existing = businessRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Business non trouvé : " + id));
        existing.setName(updated.getName());
        existing.setDomain(updated.getDomain());
        existing.setDescription(updated.getDescription());
        existing.setNeededEducation(updated.getNeededEducation());
        existing.setNeededTraining(updated.getNeededTraining());
        return businessRepository.save(existing);
    }

    public void deleteById(UUID id) {
        businessRepository.deleteById(id);
    }
}