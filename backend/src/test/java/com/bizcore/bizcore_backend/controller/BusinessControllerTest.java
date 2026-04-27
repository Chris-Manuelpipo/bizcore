package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.Business;
import com.bizcore.bizcore_backend.dto.BusinessDTO;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.service.BusinessService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BusinessController.class)
class BusinessControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BusinessService businessService;

    private Business business;
    private BusinessDTO businessDTO;
    private UUID businessId;
    private UUID tenantId;

    @BeforeEach
    void setUp() {
        businessId = UUID.randomUUID();
        tenantId = UUID.randomUUID();

        business = new Business();
        business.setId(businessId);
        business.setName("Pharmacien");
        business.setDomain("Santé");
        business.setDescription("Dispensation et conseil sur les médicaments");
        business.setNeededEducation("Doctorat en pharmacie");
        business.setNeededTraining("Stage hospitalier 6 mois");

        businessDTO = new BusinessDTO();
        businessDTO.setId(businessId);
        businessDTO.setName("Pharmacien");
        businessDTO.setDomain("Santé");
        businessDTO.setDescription("Dispensation et conseil sur les médicaments");
        businessDTO.setNeededEducation("Doctorat en pharmacie");
        businessDTO.setNeededTraining("Stage hospitalier 6 mois");
        businessDTO.setTenantId(tenantId);
    }

    @Test
    @WithMockUser
    void findAll_shouldReturnPagedBusinesses() throws Exception {
        Page<Business> page = new PageImpl<>(Arrays.asList(business));
        when(businessService.findAll(any(PageRequest.class))).thenReturn(page);

        mockMvc.perform(get("/api/businesses")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].name").value("Pharmacien"))
                .andExpect(jsonPath("$.content[0].domain").value("Santé"));

        verify(businessService, times(1)).findAll(any(PageRequest.class));
    }

    @Test
    @WithMockUser
    void findById_shouldReturnBusiness_whenExists() throws Exception {
        when(businessService.findById(businessId)).thenReturn(Optional.of(business));

        mockMvc.perform(get("/api/businesses/{id}", businessId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(businessId.toString()))
                .andExpect(jsonPath("$.name").value("Pharmacien"))
                .andExpect(jsonPath("$.domain").value("Santé"));

        verify(businessService, times(1)).findById(businessId);
    }

    @Test
    @WithMockUser
    void findById_shouldReturnNotFound_whenNotExists() throws Exception {
        when(businessService.findById(businessId)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/businesses/{id}", businessId))
                .andExpect(status().isNotFound());

        verify(businessService, times(1)).findById(businessId);
    }

    @Test
    @WithMockUser
    void findByDomain_shouldReturnBusinesses() throws Exception {
        when(businessService.findByDomain("Santé")).thenReturn(Arrays.asList(business));

        mockMvc.perform(get("/api/businesses/domain/{domain}", "Santé"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Pharmacien"));

        verify(businessService, times(1)).findByDomain("Santé");
    }

    @Test
    @WithMockUser
    void search_shouldReturnMatchingBusinesses() throws Exception {
        when(businessService.search("pharma")).thenReturn(Arrays.asList(business));

        mockMvc.perform(get("/api/businesses/search")
                        .param("name", "pharma"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Pharmacien"));

        verify(businessService, times(1)).search("pharma");
    }

    @Test
    @WithMockUser
    void create_shouldReturnCreatedBusiness() throws Exception {
        when(businessService.save(any(UUID.class), any(Business.class))).thenReturn(business);

        mockMvc.perform(post("/api/businesses")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(businessDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(businessId.toString()))
                .andExpect(jsonPath("$.name").value("Pharmacien"));

        verify(businessService, times(1)).save(any(UUID.class), any(Business.class));
    }

    @Test
    @WithMockUser
    void create_shouldReturnBadRequest_whenInvalidData() throws Exception {
        BusinessDTO invalidDTO = new BusinessDTO();
        invalidDTO.setName(""); // Empty name

        mockMvc.perform(post("/api/businesses")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isBadRequest());

        verify(businessService, never()).save(any(), any());
    }

    @Test
    @WithMockUser
    void update_shouldReturnUpdatedBusiness() throws Exception {
        BusinessDTO updatedDTO = new BusinessDTO();
        updatedDTO.setName("Pharmacien Senior");
        updatedDTO.setDomain("Santé");
        updatedDTO.setDescription("Description mise à jour");
        updatedDTO.setTenantId(tenantId);

        Business updatedBusiness = new Business();
        updatedBusiness.setId(businessId);
        updatedBusiness.setName("Pharmacien Senior");
        updatedBusiness.setDomain("Santé");
        updatedBusiness.setDescription("Description mise à jour");

        when(businessService.update(eq(businessId), any(UUID.class), any(Business.class)))
                .thenReturn(updatedBusiness);

        mockMvc.perform(put("/api/businesses/{id}", businessId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Pharmacien Senior"))
                .andExpect(jsonPath("$.description").value("Description mise à jour"));

        verify(businessService, times(1)).update(eq(businessId), any(UUID.class), any(Business.class));
    }

    @Test
    @WithMockUser
    void delete_shouldReturnNoContent() throws Exception {
        doNothing().when(businessService).deleteById(businessId);

        mockMvc.perform(delete("/api/businesses/{id}", businessId)
                        .with(csrf()))
                .andExpect(status().isNoContent());

        verify(businessService, times(1)).deleteById(businessId);
    }
}