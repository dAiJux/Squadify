package com.daijux.Squadify.repository;

import com.daijux.Squadify.model.Message;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface MessageRepository extends ReactiveMongoRepository<Message, String> {
    Flux<Message> findByMatchIdOrderByTimestampAsc(String matchId);
    Mono<Message> findFirstByMatchIdOrderByTimestampDesc(String matchId);
    Mono<Long> countByMatchIdAndReceiverIdAndReadFalse(String matchId, String receiverId);
    Flux<Message> findByMatchIdAndReceiverIdAndReadFalse(String matchId, String receiverId);
}