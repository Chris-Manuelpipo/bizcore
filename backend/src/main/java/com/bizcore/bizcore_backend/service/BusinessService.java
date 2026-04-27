package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Business;
import com.bizcore.bizcore_backend.domain.Tenant;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.repository.BusinessRepository;
import com.bizcore.bizcore_backend.repository.TenantRepository;
import com.bizcore.bizcore_backend.security.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BusinessService {

    private final BusinessRepository businessRepository;
    private final TenantRepository tenantRepository;

    public BusinessService(BusinessRepository businessRepository,
                           TenantRepository tenantRepository) {
        this.businessRepository = businessRepository;
        this.tenantRepository = tenantRepository;
    }

    /**
     * Liste les métiers du tenant courant (TenantContext).
     * Si aucun tenant n'est défini dans le contexte (endpoint public),
     * retourne tous les métiers (comportement admin).
     */
    public Page<Business> findAll(Pageable pageable) {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId != null) {
            return businessRepository.findAllByTenantId(tenantId, pageable);
        }
        return businessRepository.findAll(pageable);
    }

    public Optional<Business> findById(UUID id) {
        return businessRepository.findById(id);
    }

    public List<Business> findByDomain(String domain) {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId != null) {
            return businessRepository.findByDomainAndTenantId(domain, tenantId);
        }
        return businessRepository.findByDomain(domain);
    }

    public List<Business> search(String name) {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId != null) {
            return businessRepository.findByNameContainingIgnoreCaseAndTenantId(name, tenantId);
        }
        return businessRepository.findByNameContainingIgnoreCase(name);
    }

    public Business save(UUID tenantId, Business business) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId.toString()));
        business.setTenant(tenant);
        return businessRepository.save(business);
    }

    public Business update(UUID id, UUID tenantId, Business updated) {
        Business existing = businessRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business", id.toString()));
        existing.setName(updated.getName());
        existing.setDomain(updated.getDomain());
        existing.setDescription(updated.getDescription());
        existing.setNeededEducation(updated.getNeededEducation());
        existing.setNeededTraining(updated.getNeededTraining());
        existing.setTypeOfInvolvedActors(updated.getTypeOfInvolvedActors());
        existing.setRequiredJobProfiles(updated.getRequiredJobProfiles());
        return businessRepository.save(existing);
    }

    public void deleteById(UUID id) {
        businessRepository.deleteById(id);
    }
}