package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.Invoice;
import com.bizcore.bizcore_backend.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
@Tag(name = "Invoices", description = "Gestion des factures — ACK du service rendu")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    @Operation(summary = "Lister toutes les factures")
    public List<Invoice> findAll() {
        return invoiceService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Trouver une facture par ID")
    public ResponseEntity<Invoice> findById(@PathVariable UUID id) {
        return invoiceService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/service-request/{serviceRequestId}")
    @Operation(summary = "Trouver la facture d'une demande de service")
    public ResponseEntity<Invoice> findByServiceRequest(@PathVariable UUID serviceRequestId) {
        return invoiceService.findByServiceRequestId(serviceRequestId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/service-request/{serviceRequestId}")
    @Operation(summary = "Créer une facture pour une demande de service")
    public ResponseEntity<Invoice> create(@PathVariable UUID serviceRequestId,
                                          @RequestBody Invoice invoice) {
        Invoice saved = invoiceService.save(serviceRequestId, invoice);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/{id}/pay")
    @Operation(summary = "Marquer une facture comme payée")
    public ResponseEntity<Invoice> pay(@PathVariable UUID id) {
        return ResponseEntity.ok(invoiceService.pay(id));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Annuler une facture")
    public ResponseEntity<Invoice> cancel(@PathVariable UUID id) {
        return ResponseEntity.ok(invoiceService.cancel(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une facture")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        invoiceService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}