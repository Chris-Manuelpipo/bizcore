package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Tenant;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.repository.TenantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TenantServiceTest {

    @Mock
    private TenantRepository tenantRepository;

    @InjectMocks
    private TenantService tenantService;

    private UUID tenantId;
    private Tenant tenant;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();

        tenant = new Tenant();
        tenant.setId(tenantId);
        tenant.setName("Pharmacie Centrale");
        tenant.setDomain("Santé");
        tenant.setDescription("Pharmacie de garde");
        tenant.setIsActive(true);
    }

    @Test
    void findAll_shouldReturnAllTenants() {
        when(tenantRepository.findAll()).thenReturn(Arrays.asList(tenant));

        List<Tenant> result = tenantService.findAll();

        assertEquals(1, result.size());
        assertEquals("Pharmacie Centrale", result.get(0).getName());
        verify(tenantRepository, times(1)).findAll();
    }

    @Test
    void findActive_shouldReturnActiveTenants() {
        when(tenantRepository.findByIsActiveTrue()).thenReturn(Arrays.asList(tenant));

        List<Tenant> result = tenantService.findActive();

        assertEquals(1, result.size());
        assertTrue(result.get(0).getIsActive());
        verify(tenantRepository, times(1)).findByIsActiveTrue();
    }

    @Test
    void findById_shouldReturnTenant_whenExists() {
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));

        Optional<Tenant> result = tenantService.findById(tenantId);

        assertTrue(result.isPresent());
        assertEquals("Pharmacie Centrale", result.get().getName());
        assertEquals("Santé", result.get().getDomain());
    }

    @Test
    void findById_shouldReturnEmpty_whenNotExists() {
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.empty());

        Optional<Tenant> result = tenantService.findById(tenantId);

        assertFalse(result.isPresent());
    }

    @Test
    void register_shouldCreateTenant() {
        when(tenantRepository.existsByName("Pharmacie Centrale")).thenReturn(false);
        when(tenantRepository.save(any(Tenant.class))).thenReturn(tenant);

        Tenant result = tenantService.register(tenant);

        assertNotNull(result);
        assertEquals("Pharmacie Centrale", result.getName());
        verify(tenantRepository, times(1)).existsByName("Pharmacie Centrale");
        verify(tenantRepository, times(1)).save(tenant);
    }

    @Test
    void register_shouldThrowException_whenNameAlreadyExists() {
        when(tenantRepository.existsByName("Pharmacie Centrale")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> tenantService.register(tenant));
        verify(tenantRepository, never()).save(any());
    }

    @Test
    void update_shouldUpdateTenant_whenExists() {
        Tenant updated = new Tenant();
        updated.setName("Pharmacie Centrale Updated");
        updated.setDomain("Santé");
        updated.setDescription("Description mise à jour");

        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(tenantRepository.save(any(Tenant.class))).thenReturn(tenant);

        Tenant result = tenantService.update(tenantId, updated);

        assertNotNull(result);
        verify(tenantRepository, times(1)).findById(tenantId);
        verify(tenantRepository, times(1)).save(any(Tenant.class));
    }

    @Test
    void update_shouldThrowException_whenNotExists() {
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> tenantService.update(tenantId, tenant));
    }

    @Test
    void deactivate_shouldMarkTenantAsInactive() {
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(tenantRepository.save(any(Tenant.class))).thenReturn(tenant);

        tenantService.deactivate(tenantId);

        assertFalse(tenant.getIsActive());
        verify(tenantRepository, times(1)).findById(tenantId);
        verify(tenantRepository, times(1)).save(tenant);
    }

    @Test
    void deactivate_shouldThrowException_whenNotExists() {
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> tenantService.deactivate(tenantId));
    }
}