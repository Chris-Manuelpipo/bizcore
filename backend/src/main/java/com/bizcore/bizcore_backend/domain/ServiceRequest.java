package com.bizcore.bizcore_backend.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "service_requests")
public class ServiceRequest {

    public enum Status {
        PENDING, ACCEPTED, IN_PROGRESS, FULFILLED, CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // ── Couche 3 BCaaS : isolation multitenant ────────────────────────────
    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tenant_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Tenant tenant;

    // ── Acteurs : émetteur (CdS) et récepteur (FdS) ──────────────────────
    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "consumer_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Actor consumer;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "provider_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Actor provider;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "business_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Business business;

    @NotBlank
    @Column(name = "service_name", nullable = false)
    private String serviceName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // ── Automate d'états — modifié uniquement via ServiceRequestService ───
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.PENDING;

    // ── Headers BCaaS (couche 2) ──────────────────────────────────────────
    // Lié au header HTTP X-Trace-ID — une valeur unique par requête entrante
    @Column(name = "trace_id")
    private UUID traceId;

    // Lié à l'Invoice générée — permet de corréler SR et facture dans Kafka
    @Column(name = "correlation_id")
    private UUID correlationId;

    // ── Horodatages de chaque étape (audit trail dans l'entité) ──────────
    @Column(name = "requested_at", updatable = false)
    private LocalDateTime requestedAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "fulfilled_at")
    private LocalDateTime fulfilledAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @PrePersist
    protected void onCreate() {
        this.requestedAt = LocalDateTime.now();
        // Génère un correlationId dès la création — liera la SR à sa future Invoice
        if (this.correlationId == null) {
            this.correlationId = UUID.randomUUID();
        }
    }

    // ── Getters ───────────────────────────────────────────────────────────
    public UUID getId() { return id; }

    public Tenant getTenant() { return tenant; }
    public void setTenant(Tenant tenant) { this.tenant = tenant; }

    public Actor getConsumer() { return consumer; }
    public void setConsumer(Actor consumer) { this.consumer = consumer; }

    public Actor getProvider() { return provider; }
    public void setProvider(Actor provider) { this.provider = provider; }

    public Business getBusiness() { return business; }
    public void setBusiness(Business business) { this.business = business; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    // Note : pas de setStatus() — les transitions passent par ServiceRequestService
    public Status getStatus() { return status; }

    public UUID getTraceId() { return traceId; }
    public void setTraceId(UUID traceId) { this.traceId = traceId; }

    public UUID getCorrelationId() { return correlationId; }
    public void setCorrelationId(UUID correlationId) { this.correlationId = correlationId; }

    public LocalDateTime getRequestedAt() { return requestedAt; }

    public LocalDateTime getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(LocalDateTime acceptedAt) { this.acceptedAt = acceptedAt; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getFulfilledAt() { return fulfilledAt; }
    public void setFulfilledAt(LocalDateTime fulfilledAt) { this.fulfilledAt = fulfilledAt; }

    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
}