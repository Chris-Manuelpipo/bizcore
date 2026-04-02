package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Tenant;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.repository.TenantRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TenantService {

    private final TenantRepository tenantRepository;

    public TenantService(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    public List<Tenant> findAll() {
        return tenantRepository.findAll();
    }

    public List<Tenant> findActive() {
        return tenantRepository.findByIsActiveTrue();
    }

    public Optional<Tenant> findById(UUID id) {
        return tenantRepository.findById(id);
    }

    // Provisionnement : enregistre un nouveau tenant (une instance métier)
    public Tenant register(Tenant tenant) {
        if (tenantRepository.existsByName(tenant.getName())) {
            throw new IllegalArgumentException(
                "Un tenant avec le nom '" + tenant.getName() + "' existe déjà.");
        }
        return tenantRepository.save(tenant);
    }

    public Tenant update(UUID id, Tenant updated) {
        Tenant existing = tenantRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant", id.toString()));
        existing.setName(updated.getName());
        existing.setDomain(updated.getDomain());
        existing.setDescription(updated.getDescription());
        return tenantRepository.save(existing);
    }

    // Soft delete — ne supprime jamais en base
    public void deactivate(UUID id) {
        Tenant tenant = tenantRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant", id.toString()));
        tenant.setIsActive(false);
        tenantRepository.save(tenant);
    }
}