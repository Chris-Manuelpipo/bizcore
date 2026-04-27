package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Actor;
import com.bizcore.bizcore_backend.domain.User;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.repository.ActorRepository;
import com.bizcore.bizcore_backend.repository.UserRepository;
import com.bizcore.bizcore_backend.security.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActorServiceTest {

    @Mock
    private ActorRepository actorRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ActorService actorService;

    private UUID actorId;
    private UUID userId;
    private UUID tenantId;
    private User user;
    private Actor actor;

    @BeforeEach
    void setUp() {
        actorId = UUID.randomUUID();
        userId = UUID.randomUUID();
        tenantId = UUID.randomUUID();

        user = new User();
        user.setId(userId);
        user.setTenant(new com.bizcore.bizcore_backend.domain.Tenant());
        user.getTenant().setId(tenantId);

        actor = new Actor();
        actor.setId(actorId);
        actor.setRole("CONSUMER");
        actor.setBio("Test bio");
        actor.setIsActive(true);
        actor.setUser(user);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void findAll_withTenantContext_shouldUseTenantAwareQuery() {
        TenantContext.setTenantId(tenantId);
        Pageable pageable = PageRequest.of(0, 10);
        Page<Actor> page = new PageImpl<>(Arrays.asList(actor));
        when(actorRepository.findAllByUserTenantId(eq(tenantId), any(Pageable.class))).thenReturn(page);

        Page<Actor> result = actorService.findAll(pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("CONSUMER", result.getContent().get(0).getRole());
        verify(actorRepository, times(1)).findAllByUserTenantId(eq(tenantId), any(Pageable.class));
        verify(actorRepository, never()).findAll(any(Pageable.class));
    }

    @Test
    void findAll_withoutTenantContext_shouldReturnAll() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Actor> page = new PageImpl<>(Arrays.asList(actor));
        when(actorRepository.findAll(pageable)).thenReturn(page);

        Page<Actor> result = actorService.findAll(pageable);

        assertEquals(1, result.getTotalElements());
        verify(actorRepository, times(1)).findAll(pageable);
        verify(actorRepository, never()).findAllByUserTenantId(any(), any());
    }

    @Test
    void findById_shouldReturnActor_whenExists() {
        when(actorRepository.findById(actorId)).thenReturn(Optional.of(actor));

        Optional<Actor> result = actorService.findById(actorId);

        assertTrue(result.isPresent());
        assertEquals("CONSUMER", result.get().getRole());
        assertEquals("Test bio", result.get().getBio());
    }

    @Test
    void findById_shouldReturnEmpty_whenNotExists() {
        when(actorRepository.findById(actorId)).thenReturn(Optional.empty());

        Optional<Actor> result = actorService.findById(actorId);

        assertFalse(result.isPresent());
    }

    @Test
    void findByUserId_shouldReturnActors() {
        when(actorRepository.findByUserId(userId)).thenReturn(Arrays.asList(actor));

        List<Actor> result = actorService.findByUserId(userId);

        assertEquals(1, result.size());
        assertEquals(userId, result.get(0).getUser().getId());
    }

    @Test
    void findByRole_withTenantContext_shouldUseTenantAwareQuery() {
        TenantContext.setTenantId(tenantId);
        when(actorRepository.findByRoleAndUserTenantId("CONSUMER", tenantId)).thenReturn(Arrays.asList(actor));

        List<Actor> result = actorService.findByRole("CONSUMER");

        assertEquals(1, result.size());
        verify(actorRepository, times(1)).findByRoleAndUserTenantId("CONSUMER", tenantId);
        verify(actorRepository, never()).findByRole(any());
    }

    @Test
    void findByRole_withoutTenantContext_shouldReturnAll() {
        when(actorRepository.findByRole("CONSUMER")).thenReturn(Arrays.asList(actor));

        List<Actor> result = actorService.findByRole("CONSUMER");

        assertEquals(1, result.size());
        verify(actorRepository, times(1)).findByRole("CONSUMER");
        verify(actorRepository, never()).findByRoleAndUserTenantId(any(), any());
    }

    @Test
    void save_shouldCreateActor() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(actorRepository.save(any(Actor.class))).thenReturn(actor);

        Actor result = actorService.save(userId, actor);

        assertNotNull(result);
        assertEquals("CONSUMER", result.getRole());
        assertNotNull(result.getUser());
        assertEquals(userId, result.getUser().getId());
        verify(userRepository, times(1)).findById(userId);
        verify(actorRepository, times(1)).save(actor);
    }

    @Test
    void save_shouldThrowException_whenUserNotFound() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> actorService.save(userId, actor));
    }

    @Test
    void deleteById_shouldCallRepository() {
        doNothing().when(actorRepository).deleteById(actorId);

        actorService.deleteById(actorId);

        verify(actorRepository, times(1)).deleteById(actorId);
    }
}