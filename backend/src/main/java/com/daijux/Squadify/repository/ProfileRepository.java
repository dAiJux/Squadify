package com.daijux.Squadify.repository;

import com.daijux.Squadify.model.Profile;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Mono;

public interface ProfileRepository extends ReactiveMongoRepository<Profile, String> {
    Mono<Profile> findByUserId(String userId);
    Mono<Void> deleteByUserId(String userId);
}