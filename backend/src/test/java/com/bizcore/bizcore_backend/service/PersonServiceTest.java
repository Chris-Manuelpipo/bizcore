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

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour TenantService.
 * Le tenant est l'équivalent d'un VLAN dans l'analogie réseau BizCore :
 * chaque instance métier (Pharmacie, Cabinet médical…) est un tenant isolé.
 */
@ExtendWith(MockitoExtension.class)
class PersonServiceTest {

    @Mock
    private TenantRepository tenantRepository;

    @InjectMocks
    private TenantService tenantService;

    private Tenant pharmacie;
    private UUID tenantId;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        pharmacie = new Tenant();
        pharmacie.setId(tenantId);
        pharmacie.setName("Pharmacie Centrale");
        pharmacie.setDomain("Santé");
        pharmacie.setDescription("Instance de démonstration pharmaceutique");
        pharmacie.setIsActive(true);
    }

    @Test
    void findAll_shouldReturnAllTenants() {
        when(tenantRepository.findAll()).thenReturn(List.of(pharmacie));

        List<Tenant> result = tenantService.findAll();

        assertEquals(1, result.size());
        assertEquals("Pharmacie Centrale", result.get(0).getName());
        verify(tenantRepository).findAll();
    }

    @Test
    void findActive_shouldReturnOnlyActiveTenants() {
        when(tenantRepository.findByIsActiveTrue()).thenReturn(List.of(pharmacie));

        List<Tenant> result = tenantService.findActive();

        assertEquals(1, result.size());
        assertTrue(result.get(0).getIsActive());
        verify(tenantRepository).findByIsActiveTrue();
    }

    @Test
    void findById_shouldReturnTenant_whenExists() {
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(pharmacie));

        Optional<Tenant> result = tenantService.findById(tenantId);

        assertTrue(result.isPresent());
        assertEquals("Santé", result.get().getDomain());
    }

    @Test
    void findById_shouldReturnEmpty_whenNotFound() {
        UUID unknown = UUID.randomUUID();
        when(tenantRepository.findById(unknown)).thenReturn(Optional.empty());

        Optional<Tenant> result = tenantService.findById(unknown);

        assertTrue(result.isEmpty());
    }

    @Test
    void register_shouldSaveTenant_whenNameIsUnique() {
        when(tenantRepository.existsByName("Pharmacie Centrale")).thenReturn(false);
        when(tenantRepository.save(any(Tenant.class))).thenReturn(pharmacie);

        Tenant saved = tenantService.register(pharmacie);

        assertNotNull(saved);
        assertEquals("Pharmacie Centrale", saved.getName());
        verify(tenantRepository).save(pharmacie);
    }

    @Test
    void register_shouldThrow_whenNameAlreadyExists() {
        when(tenantRepository.existsByName("Pharmacie Centrale")).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> tenantService.register(pharmacie));

        verify(tenantRepository, never()).save(any());
    }

    @Test
    void deactivate_shouldSetIsActiveFalse() {
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(pharmacie));
        when(tenantRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        tenantService.deactivate(tenantId);

        assertFalse(pharmacie.getIsActive());
        verify(tenantRepository).save(pharmacie);
    }

    @Test
    void deactivate_shouldThrow_whenTenantNotFound() {
        UUID unknown = UUID.randomUUID();
        when(tenantRepository.findById(unknown)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> tenantService.deactivate(unknown));
    }

    @Test
    void update_shouldModifyFieldsAndSave() {
        Tenant updated = new Tenant();
        updated.setName("Pharmacie Nord");
        updated.setDomain("Santé");
        updated.setDescription("Nouvelle description");

        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(pharmacie));
        when(tenantRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Tenant result = tenantService.update(tenantId, updated);

        assertEquals("Pharmacie Nord", result.getName());
        assertEquals("Nouvelle description", result.getDescription());
    }
}
