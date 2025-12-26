package com.daijux.Squadify.repository;

import com.daijux.Squadify.model.Swipe;
import com.daijux.Squadify.model.Swipe.SwipeType;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface SwipeRepository extends ReactiveMongoRepository<Swipe, String> {
    Mono<Swipe> findBySwiperIdAndTargetIdAndType(String swiperId, String targetId, SwipeType type);

    Flux<Swipe> findBySwiperId(String swiperId);

    Mono<Void> deleteBySwiperIdOrTargetId(String swiperId, String targetId);
}