package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Business;
import com.bizcore.bizcore_backend.repository.BusinessRepository;
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
class BusinessServiceTest {

    @Mock
    private BusinessRepository businessRepository;

    @InjectMocks
    private BusinessService businessService;

    private Business business;
    private UUID businessId;

    @BeforeEach
    void setUp() {
        businessId = UUID.randomUUID();
        business = new Business();
        business.setId(businessId);
        business.setName("Pharmacien");
        business.setDomain("Santé");
        business.setDescription("Dispensation et conseil sur les médicaments");
        business.setNeededEducation("Doctorat en pharmacie");
        business.setNeededTraining("Stage hospitalier 6 mois");
    }

    @Test
    void findAll_shouldReturnAllBusinesses() {
        when(businessRepository.findAll()).thenReturn(Arrays.asList(business));

        List<Business> result = businessService.findAll();

        assertEquals(1, result.size());
        assertEquals("Pharmacien", result.get(0).getName());
        verify(businessRepository, times(1)).findAll();
    }

    @Test
    void findById_shouldReturnBusiness_whenExists() {
        when(businessRepository.findById(businessId)).thenReturn(Optional.of(business));

        Optional<Business> result = businessService.findById(businessId);

        assertTrue(result.isPresent());
        assertEquals("Santé", result.get().getDomain());
    }

    @Test
    void findByDomain_shouldReturnBusinesses() {
        when(businessRepository.findByDomain("Santé")).thenReturn(Arrays.asList(business));

        List<Business> result = businessService.findByDomain("Santé");

        assertEquals(1, result.size());
        assertEquals("Pharmacien", result.get(0).getName());
    }

    @Test
    void search_shouldReturnMatchingBusinesses() {
        when(businessRepository.findByNameContainingIgnoreCase("pharma"))
                .thenReturn(Arrays.asList(business));

        List<Business> result = businessService.search("pharma");

        assertEquals(1, result.size());
    }

    @Test
    void save_shouldSaveBusiness() {
        when(businessRepository.save(any(Business.class))).thenReturn(business);

        Business result = businessService.save(business);

        assertNotNull(result);
        assertEquals("Pharmacien", result.getName());
        verify(businessRepository, times(1)).save(business);
    }

    @Test
    void update_shouldUpdateBusiness_whenExists() {
        Business updated = new Business();
        updated.setName("Pharmacien Senior");
        updated.setDomain("Santé");
        updated.setDescription("Description mise à jour");
        updated.setNeededEducation("Doctorat + spécialisation");
        updated.setNeededTraining("Stage 12 mois");

        when(businessRepository.findById(businessId)).thenReturn(Optional.of(business));
        when(businessRepository.save(any(Business.class))).thenReturn(updated);

        Business result = businessService.update(businessId, updated);

        assertEquals("Pharmacien Senior", result.getName());
        verify(businessRepository, times(1)).save(any());
    }

    @Test
    void update_shouldThrowException_whenNotExists() {
        when(businessRepository.findById(any(UUID.class))).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> businessService.update(UUID.randomUUID(), business));
    }

    @Test
    void deleteById_shouldCallRepository() {
        doNothing().when(businessRepository).deleteById(businessId);

        businessService.deleteById(businessId);

        verify(businessRepository, times(1)).deleteById(businessId);
    }
}