package com.daijux.Squadify.repository;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Mono;

public interface User extends ReactiveMongoRepository<com.daijux.Squadify.model.User, String> {
    Mono<com.daijux.Squadify.model.User> findByEmail(String email);

    Mono<com.daijux.Squadify.model.User> findByUsername(String username);
}