package com.bizcore.bizcore_backend.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "businesses")
public class Business {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Column(name = "name", nullable = false)
    private String name;

    @NotBlank
    @Column(name = "domain", nullable = false)
    private String domain;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "needed_education")
    private String neededEducation;

    @Column(name = "needed_training")
    private String neededTraining;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getNeededEducation() { return neededEducation; }
    public void setNeededEducation(String neededEducation) { this.neededEducation = neededEducation; }

    public String getNeededTraining() { return neededTraining; }
    public void setNeededTraining(String neededTraining) { this.neededTraining = neededTraining; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}