package com.bizcore.bizcore_backend.dto;

import com.bizcore.bizcore_backend.domain.Actor;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.UUID;

public class ActorDTO {

    private UUID id;
    private UUID userId;
    private String userFullName;
    private String userEmail;
    private UUID tenantId;

    @NotBlank(message = "Le rôle est obligatoire")
    private String role;

    private String bio;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public ActorDTO() {}

    public static ActorDTO fromEntity(Actor actor) {
        ActorDTO dto = new ActorDTO();
        dto.setId(actor.getId());
        dto.setRole(actor.getRole());
        dto.setBio(actor.getBio());
        dto.setIsActive(actor.getIsActive());
        dto.setCreatedAt(actor.getCreatedAt());
        if (actor.getUser() != null) {
            dto.setUserId(actor.getUser().getId());
            dto.setUserFullName(actor.getUser().getFirstName()
                    + " " + actor.getUser().getLastName());
            dto.setUserEmail(actor.getUser().getEmail());
            if (actor.getUser().getTenant() != null) {
                dto.setTenantId(actor.getUser().getTenant().getId());
            }
        }
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getUserFullName() { return userFullName; }
    public void setUserFullName(String userFullName) { this.userFullName = userFullName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
