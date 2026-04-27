package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Business;
import com.bizcore.bizcore_backend.domain.BusinessRule;
import com.bizcore.bizcore_backend.repository.BusinessRepository;
import com.bizcore.bizcore_backend.repository.BusinessRuleRepository;
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
class BusinessRuleServiceTest {

    @Mock
    private BusinessRuleRepository businessRuleRepository;

    @Mock
    private BusinessRepository businessRepository;

    @InjectMocks
    private BusinessRuleService businessRuleService;

    private UUID ruleId;
    private UUID businessId;
    private Business business;
    private BusinessRule rule;

    @BeforeEach
    void setUp() {
        ruleId = UUID.randomUUID();
        businessId = UUID.randomUUID();

        business = new Business();
        business.setId(businessId);
        business.setName("Pharmacien");
        business.setDomain("Santé");

        rule = new BusinessRule();
        rule.setId(ruleId);
        rule.setRuleKey("PRESCRIPTION_REQUIRED");
        rule.setRuleValue("true");
        rule.setDescription("Ordonnance obligatoire");
        rule.setBusiness(business);
    }

    @Test
    void findAll_shouldReturnAllRules() {
        when(businessRuleRepository.findAll()).thenReturn(Arrays.asList(rule));

        List<BusinessRule> result = businessRuleService.findAll();

        assertEquals(1, result.size());
        assertEquals("PRESCRIPTION_REQUIRED", result.get(0).getRuleKey());
        verify(businessRuleRepository, times(1)).findAll();
    }

    @Test
    void findById_shouldReturnRule_whenExists() {
        when(businessRuleRepository.findById(ruleId)).thenReturn(Optional.of(rule));

        Optional<BusinessRule> result = businessRuleService.findById(ruleId);

        assertTrue(result.isPresent());
        assertEquals("PRESCRIPTION_REQUIRED", result.get().getRuleKey());
    }

    @Test
    void findById_shouldReturnEmpty_whenNotExists() {
        when(businessRuleRepository.findById(ruleId)).thenReturn(Optional.empty());

        Optional<BusinessRule> result = businessRuleService.findById(ruleId);

        assertFalse(result.isPresent());
    }

    @Test
    void findByBusinessId_shouldReturnRules() {
        when(businessRuleRepository.findByBusinessId(businessId)).thenReturn(Arrays.asList(rule));

        List<BusinessRule> result = businessRuleService.findByBusinessId(businessId);

        assertEquals(1, result.size());
        assertEquals(businessId, result.get(0).getBusiness().getId());
        verify(businessRuleRepository, times(1)).findByBusinessId(businessId);
    }

    @Test
    void save_shouldCreateRule() {
        when(businessRepository.findById(businessId)).thenReturn(Optional.of(business));
        when(businessRuleRepository.save(any(BusinessRule.class))).thenReturn(rule);

        BusinessRule result = businessRuleService.save(businessId, rule);

        assertNotNull(result);
        assertEquals("PRESCRIPTION_REQUIRED", result.getRuleKey());
        assertNotNull(result.getBusiness());
        assertEquals(businessId, result.getBusiness().getId());
        verify(businessRepository, times(1)).findById(businessId);
        verify(businessRuleRepository, times(1)).save(rule);
    }

    @Test
    void save_shouldThrowException_whenBusinessNotFound() {
        when(businessRepository.findById(businessId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> businessRuleService.save(businessId, rule));
    }

    @Test
    void update_shouldUpdateRule_whenExists() {
        BusinessRule updated = new BusinessRule();
        updated.setRuleKey("UPDATED_KEY");
        updated.setRuleValue("updated_value");
        updated.setDescription("Description mise à jour");

        when(businessRuleRepository.findById(ruleId)).thenReturn(Optional.of(rule));
        when(businessRuleRepository.save(any(BusinessRule.class))).thenReturn(rule);

        BusinessRule result = businessRuleService.update(ruleId, updated);

        assertNotNull(result);
        verify(businessRuleRepository, times(1)).findById(ruleId);
        verify(businessRuleRepository, times(1)).save(any(BusinessRule.class));
    }

    @Test
    void update_shouldThrowException_whenRuleNotFound() {
        when(businessRuleRepository.findById(ruleId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> businessRuleService.update(ruleId, rule));
    }

    @Test
    void deleteById_shouldCallRepository() {
        doNothing().when(businessRuleRepository).deleteById(ruleId);

        businessRuleService.deleteById(ruleId);

        verify(businessRuleRepository, times(1)).deleteById(ruleId);
    }
}