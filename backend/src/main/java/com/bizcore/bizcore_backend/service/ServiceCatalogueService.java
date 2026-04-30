package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Business;
import com.bizcore.bizcore_backend.domain.ServiceCatalogue;
import com.bizcore.bizcore_backend.domain.SupportedCurrency;
import com.bizcore.bizcore_backend.dto.CreateServiceCatalogueDTO;
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

    public ServiceCatalogue save(UUID businessId, CreateServiceCatalogueDTO dto) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", businessId.toString()));

        if (dto.getCurrency() != null
                && !SupportedCurrency.isSupported(dto.getCurrency())) {
            throw new RuntimeException("Devise non supportée : " + dto.getCurrency()
                    + ". Devises acceptées : XAF, XOF, NGN, KES, GHS, USD, EUR, GBP");
        }

        ServiceCatalogue catalogue = new ServiceCatalogue();
        catalogue.setBusiness(business);
        catalogue.setName(dto.getName());
        catalogue.setDescription(dto.getDescription());
        catalogue.setBasePrice(dto.getBasePrice());
        catalogue.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "XAF");
        catalogue.setIsAvailable(dto.getIsAvailable() != null ? dto.getIsAvailable() : true);
        
        return serviceCatalogueRepository.save(catalogue);
    }

    public ServiceCatalogue update(UUID id, CreateServiceCatalogueDTO dto) {
        ServiceCatalogue existing = serviceCatalogueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceCatalogue", id.toString()));

        if (dto.getCurrency() != null
                && !SupportedCurrency.isSupported(dto.getCurrency())) {
            throw new RuntimeException("Devise non supportée : " + dto.getCurrency());
        }

        if (dto.getName() != null) {
            existing.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            existing.setDescription(dto.getDescription());
        }
        if (dto.getBasePrice() != null) {
            existing.setBasePrice(dto.getBasePrice());
        }
        if (dto.getCurrency() != null) {
            existing.setCurrency(dto.getCurrency());
        }
        if (dto.getIsAvailable() != null) {
            existing.setIsAvailable(dto.getIsAvailable());
        }
        
        return serviceCatalogueRepository.save(existing);
    }

    public void deleteById(UUID id) {
        serviceCatalogueRepository.deleteById(id);
    }
}
