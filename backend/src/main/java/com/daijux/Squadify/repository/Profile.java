package com.daijux.Squadify.repository;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Mono;

public interface Profile extends ReactiveMongoRepository<com.daijux.Squadify.model.Profile, String> {
    Mono<com.daijux.Squadify.model.Profile> findByUserId(String userId);
    Mono<Void> deleteByUserId(String userId);
}