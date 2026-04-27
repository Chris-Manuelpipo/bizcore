package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.Invoice;
import com.bizcore.bizcore_backend.domain.ServiceRequest;
import com.bizcore.bizcore_backend.dto.InvoiceDTO;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.service.InvoiceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(InvoiceController.class)
class InvoiceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private InvoiceService invoiceService;

    private Invoice invoice;
    private InvoiceDTO invoiceDTO;
    private ServiceRequest serviceRequest;
    private UUID invoiceId;
    private UUID serviceRequestId;

    @BeforeEach
    void setUp() {
        invoiceId = UUID.randomUUID();
        serviceRequestId = UUID.randomUUID();

        serviceRequest = new ServiceRequest();
        serviceRequest.setId(serviceRequestId);
        serviceRequest.setServiceName("Test Service");

        invoice = new Invoice();
        invoice.setId(invoiceId);
        invoice.setServiceRequest(serviceRequest);
        invoice.setAmount(new BigDecimal("10000.00"));
        invoice.setCurrency("XAF");
        invoice.setStatus(Invoice.Status.PENDING);

        invoiceDTO = new InvoiceDTO();
        invoiceDTO.setId(invoiceId);
        invoiceDTO.setAmount(new BigDecimal("10000.00"));
        invoiceDTO.setCurrency("XAF");
        invoiceDTO.setStatus(Invoice.Status.PENDING);
    }

    @Test
    @WithMockUser
    void findAll_shouldReturnInvoices() throws Exception {
        when(invoiceService.findAll()).thenReturn(Arrays.asList(invoice));

        mockMvc.perform(get("/api/invoices"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(invoiceId.toString()))
                .andExpect(jsonPath("$[0].amount").value(10000.00))
                .andExpect(jsonPath("$[0].currency").value("XAF"))
                .andExpect(jsonPath("$[0].status").value("PENDING"));

        verify(invoiceService, times(1)).findAll();
    }

    @Test
    @WithMockUser
    void findById_shouldReturnInvoice_whenExists() throws Exception {
        when(invoiceService.findById(invoiceId)).thenReturn(Optional.of(invoice));

        mockMvc.perform(get("/api/invoices/{id}", invoiceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(invoiceId.toString()))
                .andExpect(jsonPath("$.amount").value(10000.00))
                .andExpect(jsonPath("$.currency").value("XAF"));

        verify(invoiceService, times(1)).findById(invoiceId);
    }

    @Test
    @WithMockUser
    void findById_shouldReturnNotFound_whenNotExists() throws Exception {
        when(invoiceService.findById(invoiceId)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/invoices/{id}", invoiceId))
                .andExpect(status().isNotFound());

        verify(invoiceService, times(1)).findById(invoiceId);
    }

    @Test
    @WithMockUser
    void findByServiceRequestId_shouldReturnInvoice() throws Exception {
        when(invoiceService.findByServiceRequestId(serviceRequestId)).thenReturn(Optional.of(invoice));

        mockMvc.perform(get("/api/invoices/service-request/{serviceRequestId}", serviceRequestId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(invoiceId.toString()));

        verify(invoiceService, times(1)).findByServiceRequestId(serviceRequestId);
    }

    @Test
    @WithMockUser
    void findByStatus_shouldReturnInvoices() throws Exception {
        when(invoiceService.findByStatus(Invoice.Status.PENDING)).thenReturn(Arrays.asList(invoice));

        mockMvc.perform(get("/api/invoices/status").param("status", "PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].status").value("PENDING"));

        verify(invoiceService, times(1)).findByStatus(Invoice.Status.PENDING);
    }

    @Test
    @WithMockUser
    void create_shouldReturnCreatedInvoice() throws Exception {
        when(invoiceService.save(eq(serviceRequestId), any(Invoice.class))).thenReturn(invoice);

        mockMvc.perform(post("/api/invoices/service-request/{serviceRequestId}", serviceRequestId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invoiceDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(invoiceId.toString()))
                .andExpect(jsonPath("$.amount").value(10000.00));

        verify(invoiceService, times(1)).save(eq(serviceRequestId), any(Invoice.class));
    }

    @Test
    @WithMockUser
    void create_shouldReturnNotFound_whenServiceRequestNotExists() throws Exception {
        when(invoiceService.save(eq(serviceRequestId), any(Invoice.class)))
                .thenThrow(new ResourceNotFoundException("ServiceRequest", serviceRequestId.toString()));

        mockMvc.perform(post("/api/invoices/service-request/{serviceRequestId}", serviceRequestId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invoiceDTO)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void pay_shouldReturnPaidInvoice() throws Exception {
        invoice.setStatus(Invoice.Status.PAID);
        when(invoiceService.pay(invoiceId)).thenReturn(invoice);

        mockMvc.perform(put("/api/invoices/{id}/pay", invoiceId)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAID"));

        verify(invoiceService, times(1)).pay(invoiceId);
    }

    @Test
    @WithMockUser
    void cancel_shouldReturnCancelledInvoice() throws Exception {
        invoice.setStatus(Invoice.Status.CANCELLED);
        when(invoiceService.cancel(invoiceId)).thenReturn(invoice);

        mockMvc.perform(put("/api/invoices/{id}/cancel", invoiceId)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        verify(invoiceService, times(1)).cancel(invoiceId);
    }

    @Test
    @WithMockUser
    void delete_shouldReturnNoContent() throws Exception {
        doNothing().when(invoiceService).deleteById(invoiceId);

        mockMvc.perform(delete("/api/invoices/{id}", invoiceId)
                        .with(csrf()))
                .andExpect(status().isNoContent());

        verify(invoiceService, times(1)).deleteById(invoiceId);
    }
}