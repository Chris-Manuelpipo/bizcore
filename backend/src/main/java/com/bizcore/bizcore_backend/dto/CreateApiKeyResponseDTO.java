package com.bizcore.bizcore_backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/** Réponse unique à la création : contient la clé en clair (affichée une seule fois). */
public class CreateApiKeyResponseDTO {

    private ApiKeyDTO apiKey;
    private String secretKey;

    public CreateApiKeyResponseDTO(ApiKeyDTO apiKey, String secretKey) {
        this.apiKey = apiKey;
        this.secretKey = secretKey;
    }

    public ApiKeyDTO getApiKey() { return apiKey; }
    public String getSecretKey() { return secretKey; }
}
