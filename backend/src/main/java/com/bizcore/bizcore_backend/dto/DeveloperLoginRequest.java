package com.bizcore.bizcore_backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Connexion développeur")
public class DeveloperLoginRequest {

    @Schema(description = "Email du compte développeur", example = "marie.dev@example.com", requiredMode = Schema.RequiredMode.REQUIRED)
    @Email
    @NotBlank
    private String email;

    @Schema(description = "Mot de passe", example = "secret123", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank
    private String password;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
