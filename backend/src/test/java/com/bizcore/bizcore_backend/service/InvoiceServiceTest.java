package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Invoice;
import com.bizcore.bizcore_backend.domain.ServiceRequest;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.repository.InvoiceRepository;
import com.bizcore.bizcore_backend.repository.ServiceRequestRepository;
import com.bizcore.bizcore_backend.security.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private ServiceRequestRepository serviceRequestRepository;

    @InjectMocks
    private InvoiceService invoiceService;

    private UUID invoiceId;
    private UUID serviceRequestId;
    private UUID tenantId;
    private Invoice invoice;
    private ServiceRequest serviceRequest;

    @BeforeEach
    void setUp() {
        invoiceId = UUID.randomUUID();
        serviceRequestId = UUID.randomUUID();
        tenantId = UUID.randomUUID();

        serviceRequest = new ServiceRequest();
        serviceRequest.setId(serviceRequestId);
        serviceRequest.setServiceName("Test Service");

        invoice = new Invoice();
        invoice.setId(invoiceId);
        invoice.setServiceRequest(serviceRequest);
        invoice.setAmount(new BigDecimal("10000.00"));
        invoice.setCurrency("XAF");
        invoice.setStatus(Invoice.Status.PENDING);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void findAll_withTenantContext_shouldUseTenantAwareQuery() {
        TenantContext.setTenantId(tenantId);
        when(invoiceRepository.findAllByTenantId(tenantId)).thenReturn(Arrays.asList(invoice));

        List<Invoice> result = invoiceService.findAll();

        assertEquals(1, result.size());
        verify(invoiceRepository, times(1)).findAllByTenantId(eq(tenantId));
        verify(invoiceRepository, never()).findAll();
    }

    @Test
    void findAll_withoutTenantContext_shouldReturnAll() {
        when(invoiceRepository.findAll()).thenReturn(Arrays.asList(invoice));

        List<Invoice> result = invoiceService.findAll();

        assertEquals(1, result.size());
        verify(invoiceRepository, times(1)).findAll();
        verify(invoiceRepository, never()).findAllByTenantId(any());
    }

    @Test
    void findById_shouldReturnInvoice_whenExists() {
        when(invoiceRepository.findById(invoiceId)).thenReturn(Optional.of(invoice));

        Optional<Invoice> result = invoiceService.findById(invoiceId);

        assertTrue(result.isPresent());
        assertEquals(invoiceId, result.get().getId());
        assertEquals(new BigDecimal("10000.00"), result.get().getAmount());
    }

    @Test
    void findById_shouldReturnEmpty_whenNotExists() {
        when(invoiceRepository.findById(invoiceId)).thenReturn(Optional.empty());

        Optional<Invoice> result = invoiceService.findById(invoiceId);

        assertFalse(result.isPresent());
    }

    @Test
    void findByServiceRequestId_withTenantContext_shouldUseTenantAwareQuery() {
        TenantContext.setTenantId(tenantId);
        when(invoiceRepository.findByServiceRequestIdAndTenantId(serviceRequestId, tenantId))
                .thenReturn(Optional.of(invoice));

        Optional<Invoice> result = invoiceService.findByServiceRequestId(serviceRequestId);

        assertTrue(result.isPresent());
        verify(invoiceRepository, times(1)).findByServiceRequestIdAndTenantId(serviceRequestId, tenantId);
        verify(invoiceRepository, never()).findByServiceRequestId(any());
    }

    @Test
    void findByServiceRequestId_withoutTenantContext_shouldReturnAll() {
        when(invoiceRepository.findByServiceRequestId(serviceRequestId)).thenReturn(Optional.of(invoice));

        Optional<Invoice> result = invoiceService.findByServiceRequestId(serviceRequestId);

        assertTrue(result.isPresent());
        verify(invoiceRepository, times(1)).findByServiceRequestId(serviceRequestId);
        verify(invoiceRepository, never()).findByServiceRequestIdAndTenantId(any(), any());
    }

    @Test
    void findByStatus_withTenantContext_shouldUseTenantAwareQuery() {
        TenantContext.setTenantId(tenantId);
        when(invoiceRepository.findByStatusAndTenantId(Invoice.Status.PENDING, tenantId))
                .thenReturn(Arrays.asList(invoice));

        List<Invoice> result = invoiceService.findByStatus(Invoice.Status.PENDING);

        assertEquals(1, result.size());
        verify(invoiceRepository, times(1)).findByStatusAndTenantId(Invoice.Status.PENDING, tenantId);
        verify(invoiceRepository, never()).findByStatus(any());
    }

    @Test
    void findByStatus_withoutTenantContext_shouldReturnAll() {
        when(invoiceRepository.findByStatus(Invoice.Status.PENDING)).thenReturn(Arrays.asList(invoice));

        List<Invoice> result = invoiceService.findByStatus(Invoice.Status.PENDING);

        assertEquals(1, result.size());
        verify(invoiceRepository, times(1)).findByStatus(Invoice.Status.PENDING);
        verify(invoiceRepository, never()).findByStatusAndTenantId(any(), any());
    }

    @Test
    void save_shouldCreateInvoice() {
        when(serviceRequestRepository.findById(serviceRequestId)).thenReturn(Optional.of(serviceRequest));
        when(invoiceRepository.save(any(Invoice.class))).thenReturn(invoice);

        Invoice result = invoiceService.save(serviceRequestId, invoice);

        assertNotNull(result);
        assertEquals(new BigDecimal("10000.00"), result.getAmount());
        assertEquals("XAF", result.getCurrency());
        assertNotNull(result.getServiceRequest());
        verify(serviceRequestRepository, times(1)).findById(serviceRequestId);
        verify(invoiceRepository, times(1)).save(invoice);
    }

    @Test
    void save_shouldThrowException_whenServiceRequestNotFound() {
        when(serviceRequestRepository.findById(serviceRequestId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> 
                invoiceService.save(serviceRequestId, invoice));
    }

    @Test
    void save_shouldThrowException_whenUnsupportedCurrency() {
        when(serviceRequestRepository.findById(serviceRequestId)).thenReturn(Optional.of(serviceRequest));
        invoice.setCurrency("UNSUPPORTED");

        assertThrows(RuntimeException.class, () -> 
                invoiceService.save(serviceRequestId, invoice));
    }

    @Test
    void save_shouldDefaultCurrencyToXAF_whenNull() {
        when(serviceRequestRepository.findById(serviceRequestId)).thenReturn(Optional.of(serviceRequest));
        when(invoiceRepository.save(any(Invoice.class))).thenReturn(invoice);
        invoice.setCurrency(null);

        Invoice result = invoiceService.save(serviceRequestId, invoice);

        assertEquals("XAF", result.getCurrency());
    }

    @Test
    void pay_shouldMarkInvoiceAsPaid() {
        invoice.setStatus(Invoice.Status.PENDING);
        when(invoiceRepository.findById(invoiceId)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.save(any(Invoice.class))).thenReturn(invoice);

        Invoice result = invoiceService.pay(invoiceId);

        assertEquals(Invoice.Status.PAID, result.getStatus());
        assertNotNull(result.getPaidAt());
        verify(invoiceRepository, times(1)).save(invoice);
    }

    @Test
    void pay_shouldThrowException_whenInvoiceNotFound() {
        when(invoiceRepository.findById(invoiceId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> invoiceService.pay(invoiceId));
    }

    @Test
    void cancel_shouldMarkInvoiceAsCancelled() {
        when(invoiceRepository.findById(invoiceId)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.save(any(Invoice.class))).thenReturn(invoice);

        Invoice result = invoiceService.cancel(invoiceId);

        assertEquals(Invoice.Status.CANCELLED, result.getStatus());
        verify(invoiceRepository, times(1)).save(invoice);
    }

    @Test
    void cancel_shouldThrowException_whenInvoiceNotFound() {
        when(invoiceRepository.findById(invoiceId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> invoiceService.cancel(invoiceId));
    }

    @Test
    void deleteById_shouldCallRepository() {
        doNothing().when(invoiceRepository).deleteById(invoiceId);

        invoiceService.deleteById(invoiceId);

        verify(invoiceRepository, times(1)).deleteById(invoiceId);
    }
}