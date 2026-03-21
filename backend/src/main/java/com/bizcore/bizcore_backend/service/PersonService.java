package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Person;
import com.bizcore.bizcore_backend.repository.PersonRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PersonService {

    private final PersonRepository personRepository;

    public PersonService(PersonRepository personRepository) {
        this.personRepository = personRepository;
    }

    public List<Person> findAll() {
        return personRepository.findAll();
    }

    public Optional<Person> findById(UUID id) {
        return personRepository.findById(id);
    }

    public Person save(Person person) {
        if (personRepository.existsByEmail(person.getEmail())) {
            throw new RuntimeException("Email déjà utilisé : " + person.getEmail());
        }
        return personRepository.save(person);
    }

    public void deleteById(UUID id) {
        personRepository.deleteById(id);
    }
}