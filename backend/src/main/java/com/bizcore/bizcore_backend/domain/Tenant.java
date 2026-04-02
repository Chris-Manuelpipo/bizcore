package com.bizcore.bizcore_backend.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tenants")
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Nom de l'instance métier — ex: "Campharma", "ImmoCore", "TourismCM"
    @NotBlank
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    // Domaine métier — ex: "pharmacie", "immobilier", "tourisme"
    @NotBlank
    @Column(name = "domain", nullable = false)
    private String domain;

    // Description libre de l'instance
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // Soft delete : un tenant désactivé ne peut plus créer de ServiceRequests
    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ── Getters / Setters ─────────────────────────────────────────────────
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}