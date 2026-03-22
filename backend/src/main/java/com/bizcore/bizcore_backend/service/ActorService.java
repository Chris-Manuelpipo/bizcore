package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Actor;
import com.bizcore.bizcore_backend.domain.Person;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.repository.ActorRepository;
import com.bizcore.bizcore_backend.repository.PersonRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ActorService {

    private final ActorRepository actorRepository;
    private final PersonRepository personRepository;

    public ActorService(ActorRepository actorRepository, PersonRepository personRepository) {
        this.actorRepository = actorRepository;
        this.personRepository = personRepository;
    }

    public Page<Actor> findAll(Pageable pageable) {
        return actorRepository.findAll(pageable);
    }

    public Optional<Actor> findById(UUID id) {
        return actorRepository.findById(id);
    }

    public List<Actor> findByPersonId(UUID personId) {
        return actorRepository.findByPersonId(personId);
    }

    public List<Actor> findByRole(String role) {
        return actorRepository.findByRole(role);
    }

    public Actor save(UUID personId, Actor actor) {
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new ResourceNotFoundException("Person", personId.toString()));
        actor.setPerson(person);
        return actorRepository.save(actor);
    }

    public void deleteById(UUID id) {
        actorRepository.deleteById(id);
    }
}