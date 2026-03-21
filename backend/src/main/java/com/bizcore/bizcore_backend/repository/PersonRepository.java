package com.bizcore.bizcore_backend.repository;

import com.bizcore.bizcore_backend.domain.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PersonRepository extends JpaRepository<Person, UUID> {
    Optional<Person> findByEmail(String email);
    boolean existsByEmail(String email);
}