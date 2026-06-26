package com.bizcore.bizcore_backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Réponse d'authentification développeur")
public class DeveloperAuthResponse {

    @Schema(description = "JWT portail — à utiliser avec le schéma developerBearerAuth")
    private String token;

    @Schema(example = "marie.dev@example.com")
    private String email;

    @Schema(example = "Marie")
    private String firstName;

    @Schema(example = "Curie")
    private String lastName;

    public DeveloperAuthResponse(String token, String email, String firstName, String lastName) {
        this.token = token;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public String getToken() { return token; }
    public String getEmail() { return email; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
}
