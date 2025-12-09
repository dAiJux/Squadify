package com.daijux.Squadify.repository;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Mono;

public interface Match extends ReactiveMongoRepository<com.daijux.Squadify.model.Match, String> {
    Mono<com.daijux.Squadify.model.Match> findByUser1IdAndUser2Id(String user1Id, String user2Id);
    Mono<Void> deleteByUser1IdOrUser2Id(String user1Id, String user2Id);
}