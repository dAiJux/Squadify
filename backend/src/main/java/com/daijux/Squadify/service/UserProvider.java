package com.daijux.Squadify.service;

import com.daijux.Squadify.repository.UserRepository;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class UserProvider implements ReactiveUserDetailsService {

    private final UserRepository userRepository;

    public UserProvider(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public Mono<UserDetails> findByUsername(String identifier) {
        return userRepository.findByUsername(identifier)
                .switchIfEmpty(userRepository.findByEmail(identifier))
                .cast(UserDetails.class);
    }
}