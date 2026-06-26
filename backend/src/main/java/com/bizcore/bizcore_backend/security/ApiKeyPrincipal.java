package com.bizcore.bizcore_backend.security;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;
import java.util.UUID;

/**
 * Principal Spring Security pour une clé API (accès programmatique).
 */
public class ApiKeyPrincipal implements UserDetails {

    private final UUID apiKeyId;
    private final UUID developerId;
    private final UUID tenantId;
    private final String keyPrefix;

    public ApiKeyPrincipal(UUID apiKeyId, UUID developerId, UUID tenantId, String keyPrefix) {
        this.apiKeyId = apiKeyId;
        this.developerId = developerId;
        this.tenantId = tenantId;
        this.keyPrefix = keyPrefix;
    }

    public UUID getApiKeyId() { return apiKeyId; }
    public UUID getDeveloperId() { return developerId; }
    public UUID getTenantId() { return tenantId; }

    @Override
    public List<SimpleGrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_API_CLIENT"));
    }

    @Override
    public String getPassword() { return ""; }

    @Override
    public String getUsername() { return keyPrefix; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
