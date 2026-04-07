package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Actor;
import com.bizcore.bizcore_backend.domain.User;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.repository.ActorRepository;
import com.bizcore.bizcore_backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ActorService {

    private final ActorRepository actorRepository;
    private final UserRepository userRepository;

    public ActorService(ActorRepository actorRepository, UserRepository userRepository) {
        this.actorRepository = actorRepository;
        this.userRepository = userRepository;
    }

    public Page<Actor> findAll(Pageable pageable) {
        return actorRepository.findAll(pageable);
    }

    public Optional<Actor> findById(UUID id) {
        return actorRepository.findById(id);
    }

    public List<Actor> findByUserId(UUID userId) {
        return actorRepository.findByUserId(userId);
    }

    public List<Actor> findByRole(String role) {
        return actorRepository.findByRole(role);
    }

    public Actor save(UUID userId, Actor actor) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));
        actor.setUser(user);
        return actorRepository.save(actor);
    }

    public void deleteById(UUID id) {
        actorRepository.deleteById(id);
    }
}
