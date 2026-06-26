package com.bizcore.bizcore_backend.security;

import com.bizcore.bizcore_backend.domain.Developer;
import com.bizcore.bizcore_backend.repository.DeveloperRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class DeveloperContextService {

    private final DeveloperRepository developerRepository;

    public DeveloperContextService(DeveloperRepository developerRepository) {
        this.developerRepository = developerRepository;
    }

    public Developer requireCurrentDeveloper() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Authentification développeur requise");
        }

        boolean isDeveloper = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_DEVELOPER".equals(a.getAuthority()));
        if (!isDeveloper) {
            throw new AccessDeniedException("Accès réservé aux développeurs");
        }

        return developerRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Développeur introuvable"));
    }
}
