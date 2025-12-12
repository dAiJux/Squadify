package com.daijux.Squadify.repository;

import com.daijux.Squadify.model.Match;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface MatchRepository extends ReactiveMongoRepository<Match, String> {
    Mono<Match> findByUser1IdAndUser2Id(String user1Id, String user2Id);
    Flux<Match> findByUser1IdOrUser2Id(String user1Id, String user2Id);
    Mono<Void> deleteByUser1IdOrUser2Id(String user1Id, String user2Id);
}
