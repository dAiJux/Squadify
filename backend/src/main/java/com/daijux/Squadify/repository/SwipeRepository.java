package com.daijux.Squadify.repository;

import com.daijux.Squadify.event.SwipeEvent;
import com.daijux.Squadify.model.Swipe;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Mono;

public interface SwipeRepository extends ReactiveMongoRepository<Swipe, String> {
    Mono<Swipe> findBySwiperIdAndTargetIdAndType(String swiperId, String targetId, SwipeEvent.SwipeType type);
    Mono<Void> deleteBySwiperIdOrTargetId(String swiperId, String targetId);
}