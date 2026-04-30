package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Business;
import com.bizcore.bizcore_backend.domain.ServiceCatalogue;
import com.bizcore.bizcore_backend.dto.CreateServiceCatalogueDTO;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.repository.BusinessRepository;
import com.bizcore.bizcore_backend.repository.ServiceCatalogueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServiceCatalogueServiceTest {

    @Mock
    private ServiceCatalogueRepository serviceCatalogueRepository;

    @Mock
    private BusinessRepository businessRepository;

    @InjectMocks
    private ServiceCatalogueService serviceCatalogueService;

    private UUID catalogueId;
    private UUID businessId;
    private Business business;
    private ServiceCatalogue catalogue;

    @BeforeEach
    void setUp() {
        catalogueId = UUID.randomUUID();
        businessId = UUID.randomUUID();

        business = new Business();
        business.setId(businessId);
        business.setName("Pharmacien");
        business.setDomain("Santé");

        catalogue = new ServiceCatalogue();
        catalogue.setId(catalogueId);
        catalogue.setName("Dispensation médicaments");
        catalogue.setDescription("Dispensation sur ordonnance");
        catalogue.setBasePrice(new BigDecimal("5000.00"));
        catalogue.setCurrency("XAF");
        catalogue.setIsAvailable(true);
        catalogue.setBusiness(business);
    }

    @Test
    void findAll_shouldReturnAllCatalogues() {
        when(serviceCatalogueRepository.findAll()).thenReturn(Arrays.asList(catalogue));

        List<ServiceCatalogue> result = serviceCatalogueService.findAll();

        assertEquals(1, result.size());
        assertEquals("Dispensation médicaments", result.get(0).getName());
        verify(serviceCatalogueRepository, times(1)).findAll();
    }

    @Test
    void findById_shouldReturnCatalogue_whenExists() {
        when(serviceCatalogueRepository.findById(catalogueId)).thenReturn(Optional.of(catalogue));

        Optional<ServiceCatalogue> result = serviceCatalogueService.findById(catalogueId);

        assertTrue(result.isPresent());
        assertEquals("Dispensation médicaments", result.get().getName());
    }

    @Test
    void findById_shouldReturnEmpty_whenNotExists() {
        when(serviceCatalogueRepository.findById(catalogueId)).thenReturn(Optional.empty());

        Optional<ServiceCatalogue> result = serviceCatalogueService.findById(catalogueId);

        assertFalse(result.isPresent());
    }

    @Test
    void findByBusinessId_shouldReturnCatalogues() {
        when(serviceCatalogueRepository.findByBusinessId(businessId)).thenReturn(Arrays.asList(catalogue));

        List<ServiceCatalogue> result = serviceCatalogueService.findByBusinessId(businessId);

        assertEquals(1, result.size());
        assertEquals(businessId, result.get(0).getBusiness().getId());
        verify(serviceCatalogueRepository, times(1)).findByBusinessId(businessId);
    }

    @Test
    void findAvailable_shouldReturnAvailableCatalogues() {
        when(serviceCatalogueRepository.findByIsAvailable(true)).thenReturn(Arrays.asList(catalogue));

        List<ServiceCatalogue> result = serviceCatalogueService.findAvailable();

        assertEquals(1, result.size());
        assertTrue(result.get(0).getIsAvailable());
        verify(serviceCatalogueRepository, times(1)).findByIsAvailable(true);
    }

    @Test
    void search_shouldReturnMatchingCatalogues() {
        when(serviceCatalogueRepository.findByNameContainingIgnoreCase("dispens")).thenReturn(Arrays.asList(catalogue));

        List<ServiceCatalogue> result = serviceCatalogueService.search("dispens");

        assertEquals(1, result.size());
        verify(serviceCatalogueRepository, times(1)).findByNameContainingIgnoreCase("dispens");
    }

    @Test
    void save_shouldCreateCatalogue() {
        when(businessRepository.findById(businessId)).thenReturn(Optional.of(business));
        when(serviceCatalogueRepository.save(any(ServiceCatalogue.class))).thenReturn(catalogue);

        CreateServiceCatalogueDTO dto = new CreateServiceCatalogueDTO();
        dto.setName("Dispensation médicaments");
        dto.setDescription("Dispensation sur ordonnance");
        dto.setBasePrice(new BigDecimal("5000.00"));
        dto.setCurrency("XAF");
        dto.setIsAvailable(true);

        ServiceCatalogue result = serviceCatalogueService.save(businessId, dto);

        assertNotNull(result);
        assertEquals("Dispensation médicaments", result.getName());
        assertNotNull(result.getBusiness());
        assertEquals(businessId, result.getBusiness().getId());
        verify(businessRepository, times(1)).findById(businessId);
        verify(serviceCatalogueRepository, times(1)).save(any(ServiceCatalogue.class));
    }

    @Test
    void save_shouldThrowException_whenBusinessNotFound() {
        when(businessRepository.findById(businessId)).thenReturn(Optional.empty());

        CreateServiceCatalogueDTO dto = new CreateServiceCatalogueDTO();
        dto.setName("Dispensation médicaments");
        dto.setDescription("Dispensation sur ordonnance");
        dto.setBasePrice(new BigDecimal("5000.00"));
        dto.setCurrency("XAF");
        dto.setIsAvailable(true);

        assertThrows(ResourceNotFoundException.class, () -> serviceCatalogueService.save(businessId, dto));
    }

    @Test
    void save_shouldThrowException_whenUnsupportedCurrency() {
        when(businessRepository.findById(businessId)).thenReturn(Optional.of(business));

        CreateServiceCatalogueDTO dto = new CreateServiceCatalogueDTO();
        dto.setName("Dispensation médicaments");
        dto.setDescription("Dispensation sur ordonnance");
        dto.setBasePrice(new BigDecimal("5000.00"));
        dto.setCurrency("UNSUPPORTED");
        dto.setIsAvailable(true);

        assertThrows(RuntimeException.class, () -> serviceCatalogueService.save(businessId, dto));
    }

    @Test
    void update_shouldUpdateCatalogue_whenExists() {
        CreateServiceCatalogueDTO updatedDto = new CreateServiceCatalogueDTO();
        updatedDto.setName("Updated Name");
        updatedDto.setDescription("Updated description");
        updatedDto.setBasePrice(new BigDecimal("10000.00"));
        updatedDto.setCurrency("XAF");
        updatedDto.setIsAvailable(false);

        when(serviceCatalogueRepository.findById(catalogueId)).thenReturn(Optional.of(catalogue));
        when(serviceCatalogueRepository.save(any(ServiceCatalogue.class))).thenReturn(catalogue);

        ServiceCatalogue result = serviceCatalogueService.update(catalogueId, updatedDto);

        assertNotNull(result);
        verify(serviceCatalogueRepository, times(1)).findById(catalogueId);
        verify(serviceCatalogueRepository, times(1)).save(any(ServiceCatalogue.class));
    }

    @Test
    void update_shouldThrowException_whenCatalogueNotFound() {
        when(serviceCatalogueRepository.findById(catalogueId)).thenReturn(Optional.empty());

        CreateServiceCatalogueDTO dto = new CreateServiceCatalogueDTO();
        dto.setName("Dispensation médicaments");
        dto.setDescription("Dispensation sur ordonnance");
        dto.setBasePrice(new BigDecimal("5000.00"));
        dto.setCurrency("XAF");
        dto.setIsAvailable(true);

        assertThrows(ResourceNotFoundException.class, () -> serviceCatalogueService.update(catalogueId, dto));
    }

    @Test
    void update_shouldThrowException_whenUnsupportedCurrency() {
        when(serviceCatalogueRepository.findById(catalogueId)).thenReturn(Optional.of(catalogue));

        CreateServiceCatalogueDTO dto = new CreateServiceCatalogueDTO();
        dto.setName("Dispensation médicaments");
        dto.setDescription("Dispensation sur ordonnance");
        dto.setBasePrice(new BigDecimal("5000.00"));
        dto.setCurrency("UNSUPPORTED");
        dto.setIsAvailable(true);

        assertThrows(RuntimeException.class, () -> serviceCatalogueService.update(catalogueId, dto));
    }

    @Test
    void deleteById_shouldCallRepository() {
        doNothing().when(serviceCatalogueRepository).deleteById(catalogueId);

        serviceCatalogueService.deleteById(catalogueId);

        verify(serviceCatalogueRepository, times(1)).deleteById(catalogueId);
    }
}