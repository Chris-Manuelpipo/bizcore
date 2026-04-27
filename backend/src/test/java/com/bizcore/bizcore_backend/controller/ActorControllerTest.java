package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.Actor;
import com.bizcore.bizcore_backend.domain.User;
import com.bizcore.bizcore_backend.dto.ActorDTO;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.repository.UserRepository;
import com.bizcore.bizcore_backend.service.ActorService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ActorController.class)
class ActorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ActorService actorService;

    @MockBean
    private UserRepository userRepository;

    private Actor actor;
    private ActorDTO actorDTO;
    private User user;
    private UUID actorId;
    private UUID userId;

    @BeforeEach
    void setUp() {
        actorId = UUID.randomUUID();
        userId = UUID.randomUUID();

        user = new User();
        user.setId(userId);
        user.setEmail("test@example.com");
        user.setFirstName("John");
        user.setLastName("Doe");

        actor = new Actor();
        actor.setId(actorId);
        actor.setRole("CONSUMER");
        actor.setBio("Test bio");
        actor.setIsActive(true);
        actor.setUser(user);

        actorDTO = new ActorDTO();
        actorDTO.setId(actorId);
        actorDTO.setRole("CONSUMER");
        actorDTO.setBio("Test bio");
        actorDTO.setIsActive(true);
    }

    @Test
    @WithMockUser
    void findAll_shouldReturnPagedActors() throws Exception {
        Page<Actor> page = new PageImpl<>(Arrays.asList(actor));
        when(actorService.findAll(any(PageRequest.class))).thenReturn(page);

        mockMvc.perform(get("/api/actors")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].role").value("CONSUMER"))
                .andExpect(jsonPath("$.content[0].bio").value("Test bio"));

        verify(actorService, times(1)).findAll(any(PageRequest.class));
    }

    @Test
    @WithMockUser
    void findById_shouldReturnActor_whenExists() throws Exception {
        when(actorService.findById(actorId)).thenReturn(Optional.of(actor));

        mockMvc.perform(get("/api/actors/{id}", actorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(actorId.toString()))
                .andExpect(jsonPath("$.role").value("CONSUMER"))
                .andExpect(jsonPath("$.bio").value("Test bio"));

        verify(actorService, times(1)).findById(actorId);
    }

    @Test
    @WithMockUser
    void findById_shouldReturnNotFound_whenNotExists() throws Exception {
        when(actorService.findById(actorId)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/actors/{id}", actorId))
                .andExpect(status().isNotFound());

        verify(actorService, times(1)).findById(actorId);
    }

    @Test
    @WithMockUser
    void findByUserId_shouldReturnActors() throws Exception {
        when(actorService.findByUserId(userId)).thenReturn(Arrays.asList(actor));

        mockMvc.perform(get("/api/actors/user/{userId}", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].role").value("CONSUMER"));

        verify(actorService, times(1)).findByUserId(userId);
    }

    @Test
    @WithMockUser
    void findByRole_shouldReturnActors() throws Exception {
        when(actorService.findByRole("CONSUMER")).thenReturn(Arrays.asList(actor));

        mockMvc.perform(get("/api/actors/role/{role}", "CONSUMER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].role").value("CONSUMER"));

        verify(actorService, times(1)).findByRole("CONSUMER");
    }

    @Test
    @WithMockUser
    void create_shouldReturnCreatedActor() throws Exception {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(actorService.save(eq(userId), any(Actor.class))).thenReturn(actor);

        mockMvc.perform(post("/api/actors/user/{userId}", userId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(actorDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(actorId.toString()))
                .andExpect(jsonPath("$.role").value("CONSUMER"));

        verify(actorService, times(1)).save(eq(userId), any(Actor.class));
    }

    @Test
    @WithMockUser
    void create_shouldReturnNotFound_whenUserNotExists() throws Exception {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/actors/user/{userId}", userId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(actorDTO)))
                .andExpect(status().isNotFound());

        verify(actorService, never()).save(any(), any());
    }

    @Test
    @WithMockUser
    void delete_shouldReturnNoContent() throws Exception {
        doNothing().when(actorService).deleteById(actorId);

        mockMvc.perform(delete("/api/actors/{id}", actorId)
                        .with(csrf()))
                .andExpect(status().isNoContent());

        verify(actorService, times(1)).deleteById(actorId);
    }
}