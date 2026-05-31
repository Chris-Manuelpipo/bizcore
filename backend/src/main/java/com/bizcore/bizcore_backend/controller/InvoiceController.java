package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.Invoice;
import com.bizcore.bizcore_backend.dto.InvoiceDTO;
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
@Tag(name = "Invoices", description = "Gestion des factures - ACK du service rendu")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    @Operation(summary = "Lister toutes les factures")
    public List<InvoiceDTO> findAll() {
        return invoiceService.findAll().stream().map(InvoiceDTO::fromEntity).toList();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Trouver une facture par ID")
    public ResponseEntity<InvoiceDTO> findById(@PathVariable UUID id) {
        return invoiceService.findById(id)
                .map(InvoiceDTO::fromEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Lister les factures par statut")
    public List<InvoiceDTO> findByStatus(@PathVariable Invoice.Status status) {
        return invoiceService.findByStatus(status).stream().map(InvoiceDTO::fromEntity).toList();
    }

    @GetMapping("/service-request/{serviceRequestId}")
    @Operation(summary = "Trouver la facture d'une demande de service")
    public ResponseEntity<InvoiceDTO> findByServiceRequest(@PathVariable UUID serviceRequestId) {
        return invoiceService.findByServiceRequestId(serviceRequestId)
                .map(InvoiceDTO::fromEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/service-request/{serviceRequestId}")
    @Operation(summary = "Créer une facture pour une demande de service")
    public ResponseEntity<InvoiceDTO> create(@PathVariable UUID serviceRequestId,
                                          @RequestBody Invoice invoice) {
        Invoice saved = invoiceService.save(serviceRequestId, invoice);
        return ResponseEntity.status(HttpStatus.CREATED).body(InvoiceDTO.fromEntity(saved));
    }

    @PatchMapping("/{id}/pay")
    @Operation(summary = "Marquer une facture comme payée")
    public ResponseEntity<InvoiceDTO> pay(@PathVariable UUID id) {
        return ResponseEntity.ok(InvoiceDTO.fromEntity(invoiceService.pay(id)));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Annuler une facture")
    public ResponseEntity<InvoiceDTO> cancel(@PathVariable UUID id) {
        return ResponseEntity.ok(InvoiceDTO.fromEntity(invoiceService.cancel(id)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une facture")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        invoiceService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}