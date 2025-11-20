package com.daijux.Squadify.service;

import com.daijux.Squadify.repository.User;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class UserProvider implements ReactiveUserDetailsService {

    private final User user;

    public UserProvider(User user) {
        this.user = user;
    }

    @Override
    public Mono<UserDetails> findByUsername(String identifier) {
        return user.findByUsername(identifier)
                .switchIfEmpty(user.findByEmail(identifier))
                .cast(UserDetails.class);
    }
}