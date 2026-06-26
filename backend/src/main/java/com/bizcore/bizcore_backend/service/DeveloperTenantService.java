package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Developer;
import com.bizcore.bizcore_backend.domain.Tenant;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.repository.TenantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class DeveloperTenantService {

    private final TenantRepository tenantRepository;

    public DeveloperTenantService(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    @Transactional(readOnly = true)
    public List<Tenant> listForDeveloper(Developer developer) {
        return tenantRepository.findByDeveloperIdOrderByCreatedAtDesc(developer.getId());
    }

    @Transactional
    public Tenant create(Developer developer, Tenant tenant) {
        if (tenantRepository.existsByName(tenant.getName())) {
            throw new IllegalArgumentException(
                    "Un tenant avec le nom '" + tenant.getName() + "' existe déjà.");
        }
        tenant.setDeveloper(developer);
        return tenantRepository.save(tenant);
    }

    @Transactional(readOnly = true)
    public Tenant getForDeveloper(Developer developer, UUID tenantId) {
        return tenantRepository.findByIdAndDeveloperId(tenantId, developer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId.toString()));
    }
}
