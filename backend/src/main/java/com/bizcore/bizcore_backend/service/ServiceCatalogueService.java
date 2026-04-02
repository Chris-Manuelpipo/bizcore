package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Business;
import com.bizcore.bizcore_backend.domain.ServiceCatalogue;
import com.bizcore.bizcore_backend.domain.SupportedCurrency;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
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
                .orElseThrow(() -> new ResourceNotFoundException("Business", businessId.toString()));

        if (catalogue.getCurrency() != null
                && !SupportedCurrency.isSupported(catalogue.getCurrency())) {
            throw new RuntimeException("Devise non supportée : " + catalogue.getCurrency()
                    + ". Devises acceptées : XAF, XOF, NGN, KES, GHS, USD, EUR, GBP");
        }

        catalogue.setBusiness(business);
        // Hériter le tenant du business
        if (business.getTenant() != null) {
            catalogue.setTenant(business.getTenant());
        }
        return serviceCatalogueRepository.save(catalogue);
    }

    public ServiceCatalogue update(UUID id, ServiceCatalogue updated) {
        ServiceCatalogue existing = serviceCatalogueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceCatalogue", id.toString()));

        if (updated.getCurrency() != null
                && !SupportedCurrency.isSupported(updated.getCurrency())) {
            throw new RuntimeException("Devise non supportée : " + updated.getCurrency());
        }

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