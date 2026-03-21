package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Business;
import com.bizcore.bizcore_backend.domain.ServiceCatalogue;
import com.bizcore.bizcore_backend.repository.BusinessRepository;
import com.bizcore.bizcore_backend.repository.ServiceCatalogueRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ServiceCatalogueService {

    private final ServiceCatalogueRepository serviceCatalogueRepository;
    private final BusinessRepository businessRepository;

    public ServiceCatalogueService(ServiceCatalogueRepository serviceCatalogueRepository,
                                   BusinessRepository businessRepository) {
        this.serviceCatalogueRepository = serviceCatalogueRepository;
        this.businessRepository = businessRepository;
    }

    public List<ServiceCatalogue> findAll() {
        return serviceCatalogueRepository.findAll();
    }

    public Optional<ServiceCatalogue> findById(UUID id) {
        return serviceCatalogueRepository.findById(id);
    }

    public List<ServiceCatalogue> findByBusinessId(UUID businessId) {
        return serviceCatalogueRepository.findByBusinessId(businessId);
    }

    public List<ServiceCatalogue> findAvailable() {
        return serviceCatalogueRepository.findByIsAvailable(true);
    }

    public List<ServiceCatalogue> search(String name) {
        return serviceCatalogueRepository.findByNameContainingIgnoreCase(name);
    }

    public ServiceCatalogue save(UUID businessId, ServiceCatalogue catalogue) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Métier non trouvé : " + businessId));
        catalogue.setBusiness(business);
        return serviceCatalogueRepository.save(catalogue);
    }

    public ServiceCatalogue update(UUID id, ServiceCatalogue updated) {
        ServiceCatalogue existing = serviceCatalogueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service non trouvé : " + id));
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setBasePrice(updated.getBasePrice());
        existing.setCurrency(updated.getCurrency());
        existing.setIsAvailable(updated.getIsAvailable());
        return serviceCatalogueRepository.save(existing);
    }

    public void deleteById(UUID id) {
        serviceCatalogueRepository.deleteById(id);
    }
}