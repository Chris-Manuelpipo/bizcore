package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.ApiKey;
import com.bizcore.bizcore_backend.domain.Developer;
import com.bizcore.bizcore_backend.domain.Tenant;
import com.bizcore.bizcore_backend.dto.ApiKeyDTO;
import com.bizcore.bizcore_backend.dto.CreateApiKeyDTO;
import com.bizcore.bizcore_backend.dto.CreateApiKeyResponseDTO;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.repository.ApiKeyRepository;
import com.bizcore.bizcore_backend.security.ApiKeyHasher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;
    private final DeveloperTenantService developerTenantService;

    public ApiKeyService(ApiKeyRepository apiKeyRepository, DeveloperTenantService developerTenantService) {
        this.apiKeyRepository = apiKeyRepository;
        this.developerTenantService = developerTenantService;
    }

    @Transactional(readOnly = true)
    public List<ApiKeyDTO> listForDeveloper(Developer developer) {
        return apiKeyRepository.findByDeveloperOrderByCreatedAtDesc(developer)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public CreateApiKeyResponseDTO create(Developer developer, CreateApiKeyDTO dto) {
        Tenant tenantInput = new Tenant();
        tenantInput.setName(dto.getTenantName());
        tenantInput.setDomain(dto.getTenantDomain());
        tenantInput.setDescription(dto.getTenantDescription());
        Tenant tenant = developerTenantService.create(developer, tenantInput);

        String rawKey = ApiKeyHasher.generateRawKey();
        ApiKey apiKey = new ApiKey();
        apiKey.setDeveloper(developer);
        apiKey.setTenant(tenant);
        apiKey.setName(dto.getName());
        apiKey.setKeyPrefix(ApiKeyHasher.extractLookupPrefix(rawKey));
        apiKey.setKeyHash(ApiKeyHasher.hash(rawKey));

        if (dto.getExpiresInDays() != null && dto.getExpiresInDays() > 0) {
            apiKey.setExpiresAt(LocalDateTime.now().plusDays(dto.getExpiresInDays()));
        }

        ApiKey saved = apiKeyRepository.save(apiKey);
        return new CreateApiKeyResponseDTO(toDto(saved), rawKey);
    }

    @Transactional
    public void revoke(Developer developer, UUID apiKeyId) {
        ApiKey apiKey = apiKeyRepository.findByIdAndDeveloper(apiKeyId, developer)
                .orElseThrow(() -> new ResourceNotFoundException("ApiKey", apiKeyId.toString()));
        apiKey.setIsActive(false);
        apiKeyRepository.save(apiKey);
    }

    private ApiKeyDTO toDto(ApiKey apiKey) {
        ApiKeyDTO dto = new ApiKeyDTO();
        dto.setId(apiKey.getId());
        dto.setName(apiKey.getName());
        dto.setKeyPrefix(apiKey.getKeyPrefix() + "…");
        dto.setTenantId(apiKey.getTenant().getId());
        dto.setTenantName(apiKey.getTenant().getName());
        dto.setExpiresAt(apiKey.getExpiresAt());
        dto.setLastUsedAt(apiKey.getLastUsedAt());
        dto.setCreatedAt(apiKey.getCreatedAt());
        dto.setActive(Boolean.TRUE.equals(apiKey.getIsActive()) && !apiKey.isExpired());
        return dto;
    }
}
