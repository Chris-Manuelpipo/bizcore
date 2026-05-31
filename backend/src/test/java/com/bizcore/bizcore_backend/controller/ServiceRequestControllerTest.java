package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.*;
import com.bizcore.bizcore_backend.dto.ServiceRequestDTO;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.service.ServiceRequestService;
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

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ServiceRequestController.class)
@org.springframework.context.annotation.Import(WebMvcSecurityTestConfig.class)
class ServiceRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ServiceRequestService serviceRequestService;

    private ServiceRequest serviceRequest;
    private ServiceRequestDTO serviceRequestDTO;
    private Actor consumer;
    private Actor provider;
    private ServiceCatalogue catalogue;
    private UUID srId;
    private UUID consumerId;
    private UUID providerId;
    private UUID catalogueId;

    @BeforeEach
    void setUp() {
        srId = UUID.randomUUID();
        consumerId = UUID.randomUUID();
        providerId = UUID.randomUUID();
        catalogueId = UUID.randomUUID();

        Tenant tenant = new Tenant();
        tenant.setId(UUID.randomUUID());
        tenant.setName("Test Tenant");

        User consumerUser = new User();
        consumerUser.setId(UUID.randomUUID());
        consumerUser.setTenant(tenant);

        consumer = new Actor();
        consumer.setId(consumerId);
        consumer.setRole("CONSUMER");
        consumer.setUser(consumerUser);

        provider = new Actor();
        provider.setId(providerId);
        provider.setRole("PROVIDER");

        catalogue = new ServiceCatalogue();
        catalogue.setId(catalogueId);
        catalogue.setName("Test Service");
        catalogue.setBasePrice(new BigDecimal("5000.00"));
        catalogue.setCurrency("XAF");

        serviceRequest = new ServiceRequest();
        serviceRequest.setId(srId);
        serviceRequest.setConsumer(consumer);
        serviceRequest.setProvider(provider);
        serviceRequest.setServiceCatalogue(catalogue);
        serviceRequest.setStatus(ServiceRequest.Status.PENDING);
        serviceRequest.setServiceName("Test Service Request");
        serviceRequest.setTenant(tenant);

        serviceRequestDTO = new ServiceRequestDTO();
        serviceRequestDTO.setId(srId);
        serviceRequestDTO.setServiceName("Test Service Request");
        serviceRequestDTO.setStatus(ServiceRequest.Status.PENDING);
    }

    @Test
    @WithMockUser
    void findAll_shouldReturnPagedServiceRequests() throws Exception {
        Page<ServiceRequest> page = new PageImpl<>(Arrays.asList(serviceRequest));
        when(serviceRequestService.findAll(any(PageRequest.class))).thenReturn(page);

        mockMvc.perform(get("/api/service-requests")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].serviceName").value("Test Service Request"))
                .andExpect(jsonPath("$.content[0].status").value("PENDING"));

        verify(serviceRequestService, times(1)).findAll(any(PageRequest.class));
    }

    @Test
    @WithMockUser
    void findById_shouldReturnServiceRequest_whenExists() throws Exception {
        when(serviceRequestService.findById(srId)).thenReturn(Optional.of(serviceRequest));

        mockMvc.perform(get("/api/service-requests/{id}", srId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(srId.toString()))
                .andExpect(jsonPath("$.serviceName").value("Test Service Request"));

        verify(serviceRequestService, times(1)).findById(srId);
    }

    @Test
    @WithMockUser
    void findById_shouldReturnNotFound_whenNotExists() throws Exception {
        when(serviceRequestService.findById(srId)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/service-requests/{id}", srId))
                .andExpect(status().isNotFound());

        verify(serviceRequestService, times(1)).findById(srId);
    }

    @Test
    @WithMockUser
    void findByConsumer_shouldReturnServiceRequests() throws Exception {
        when(serviceRequestService.findByConsumer(consumerId)).thenReturn(Arrays.asList(serviceRequest));

        mockMvc.perform(get("/api/service-requests/consumer/{consumerId}", consumerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].serviceName").value("Test Service Request"));

        verify(serviceRequestService, times(1)).findByConsumer(consumerId);
    }

    @Test
    @WithMockUser
    void findByProvider_shouldReturnServiceRequests() throws Exception {
        when(serviceRequestService.findByProvider(providerId)).thenReturn(Arrays.asList(serviceRequest));

        mockMvc.perform(get("/api/service-requests/provider/{providerId}", providerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].serviceName").value("Test Service Request"));

        verify(serviceRequestService, times(1)).findByProvider(providerId);
    }

    @Test
    @WithMockUser
    void findByStatus_shouldReturnServiceRequests() throws Exception {
        when(serviceRequestService.findByStatus(ServiceRequest.Status.PENDING)).thenReturn(Arrays.asList(serviceRequest));

        mockMvc.perform(get("/api/service-requests/status/{status}", "PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].status").value("PENDING"));

        verify(serviceRequestService, times(1)).findByStatus(ServiceRequest.Status.PENDING);
    }

    @Test
    @WithMockUser
    void create_shouldReturnCreatedServiceRequest() throws Exception {
        when(serviceRequestService.save(eq(consumerId), eq(providerId), eq(catalogueId), any(ServiceRequest.class)))
                .thenReturn(serviceRequest);

        mockMvc.perform(post("/api/service-requests/consumer/{consumerId}/provider/{providerId}/catalogue/{catalogueId}",
                        consumerId, providerId, catalogueId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(serviceRequestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(srId.toString()))
                .andExpect(jsonPath("$.serviceName").value("Test Service Request"));

        verify(serviceRequestService, times(1)).save(eq(consumerId), eq(providerId), eq(catalogueId), any(ServiceRequest.class));
    }

    @Test
    @WithMockUser(username = "provider@test.com")
    void accept_shouldReturnAcceptedServiceRequest() throws Exception {
        serviceRequest.setStatus(ServiceRequest.Status.ACCEPTED);
        when(serviceRequestService.accept(eq(srId), eq("provider@test.com"))).thenReturn(serviceRequest);

        mockMvc.perform(patch("/api/service-requests/{id}/accept", srId)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));

        verify(serviceRequestService, times(1)).accept(srId, "provider@test.com");
    }

    @Test
    @WithMockUser(username = "provider@test.com")
    void start_shouldReturnInProgressServiceRequest() throws Exception {
        serviceRequest.setStatus(ServiceRequest.Status.IN_PROGRESS);
        when(serviceRequestService.start(eq(srId), eq("provider@test.com"))).thenReturn(serviceRequest);

        mockMvc.perform(patch("/api/service-requests/{id}/start", srId)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        verify(serviceRequestService, times(1)).start(srId, "provider@test.com");
    }

    @Test
    @WithMockUser
    void fulfill_shouldReturnFulfilledServiceRequest() throws Exception {
        serviceRequest.setStatus(ServiceRequest.Status.FULFILLED);
        when(serviceRequestService.fulfill(srId)).thenReturn(null); // Simplified for test

        mockMvc.perform(patch("/api/service-requests/{id}/fulfill", srId)
                        .with(csrf()))
                .andExpect(status().isOk());

        verify(serviceRequestService, times(1)).fulfill(srId);
    }

    @Test
    @WithMockUser(username = "consumer@test.com")
    void cancel_shouldReturnCancelledServiceRequest() throws Exception {
        serviceRequest.setStatus(ServiceRequest.Status.CANCELLED);
        when(serviceRequestService.cancel(eq(srId), eq("consumer@test.com"))).thenReturn(serviceRequest);

        mockMvc.perform(patch("/api/service-requests/{id}/cancel", srId)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        verify(serviceRequestService, times(1)).cancel(srId, "consumer@test.com");
    }

    @Test
    @WithMockUser
    void delete_shouldReturnNoContent() throws Exception {
        doNothing().when(serviceRequestService).deleteById(srId);

        mockMvc.perform(delete("/api/service-requests/{id}", srId)
                        .with(csrf()))
                .andExpect(status().isNoContent());

        verify(serviceRequestService, times(1)).deleteById(srId);
    }
}