package com.bizcore.bizcore_backend.dto;

import com.bizcore.bizcore_backend.domain.Actor;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.UUID;

public class ActorDTO {

    private UUID id;
    private UUID personId;
    private String personFullName;
    private String personEmail;

    @NotBlank(message = "Le rôle est obligatoire")
    private String role;

    private String bio;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private UUID tenantId;

    public ActorDTO() {}

    public static ActorDTO fromEntity(Actor actor) {
        ActorDTO dto = new ActorDTO();
        dto.setId(actor.getId());
        dto.setRole(actor.getRole());
        dto.setBio(actor.getBio());
        dto.setIsActive(actor.getIsActive());
        dto.setCreatedAt(actor.getCreatedAt());
        if (actor.getPerson() != null) {
            dto.setPersonId(actor.getPerson().getId());
            dto.setPersonFullName(actor.getPerson().getFirstName()
                    + " " + actor.getPerson().getLastName());
            dto.setPersonEmail(actor.getPerson().getEmail());
        }
        if (actor.getTenant() != null) {
            dto.setTenantId(actor.getTenant().getId());
        }
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getPersonId() { return personId; }
    public void setPersonId(UUID personId) { this.personId = personId; }

    public String getPersonFullName() { return personFullName; }
    public void setPersonFullName(String personFullName) { this.personFullName = personFullName; }

    public String getPersonEmail() { return personEmail; }
    public void setPersonEmail(String personEmail) { this.personEmail = personEmail; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
}