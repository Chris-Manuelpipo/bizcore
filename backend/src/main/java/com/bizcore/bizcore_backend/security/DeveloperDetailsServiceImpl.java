package com.bizcore.bizcore_backend.security;

import com.bizcore.bizcore_backend.domain.Developer;
import com.bizcore.bizcore_backend.repository.DeveloperRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("developerDetailsService")
public class DeveloperDetailsServiceImpl implements UserDetailsService {

    private final DeveloperRepository developerRepository;

    public DeveloperDetailsServiceImpl(DeveloperRepository developerRepository) {
        this.developerRepository = developerRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Developer developer = developerRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Développeur non trouvé : " + email));

        return new org.springframework.security.core.userdetails.User(
                developer.getEmail(),
                developer.getPassword(),
                Boolean.TRUE.equals(developer.getIsActive()),
                true, true, true,
                List.of(new SimpleGrantedAuthority("ROLE_DEVELOPER"))
        );
    }

    public Developer loadDeveloperByEmail(String email) {
        return developerRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Développeur non trouvé : " + email));
    }
}
