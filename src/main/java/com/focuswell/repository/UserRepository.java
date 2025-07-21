package com.focuswell.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.focuswell.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);
}
