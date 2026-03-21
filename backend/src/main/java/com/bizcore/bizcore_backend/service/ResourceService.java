package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Business;
import com.bizcore.bizcore_backend.domain.Resource;
import com.bizcore.bizcore_backend.repository.BusinessRepository;
import com.bizcore.bizcore_backend.repository.ResourceRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final BusinessRepository businessRepository;

    public ResourceService(ResourceRepository resourceRepository,
                           BusinessRepository businessRepository) {
        this.resourceRepository = resourceRepository;
        this.businessRepository = businessRepository;
    }

    public List<Resource> findAll() {
        return resourceRepository.findAll();
    }

    public Optional<Resource> findById(UUID id) {
        return resourceRepository.findById(id);
    }

    public List<Resource> findByBusinessId(UUID businessId) {
        return resourceRepository.findByBusinessId(businessId);
    }

    public Resource save(UUID businessId, Resource resource) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Métier non trouvé : " + businessId));
        resource.setBusiness(business);
        return resourceRepository.save(resource);
    }

    public Resource update(UUID id, Resource updated) {
        Resource existing = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ressource non trouvée : " + id));
        existing.setName(updated.getName());
        existing.setType(updated.getType());
        existing.setQuantityAvailable(updated.getQuantityAvailable());
        existing.setDescription(updated.getDescription());
        return resourceRepository.save(existing);
    }

    public void deleteById(UUID id) {
        resourceRepository.deleteById(id);
    }
}