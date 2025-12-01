package com.daijux.Squadify.repository;

import com.daijux.Squadify.event.SwipeEvent;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Mono;

public interface Swipe extends ReactiveMongoRepository<com.daijux.Squadify.model.Swipe, String> {
    Mono<com.daijux.Squadify.model.Swipe> findBySwiperIdAndTargetIdAndType(String swiperId, String targetId, SwipeEvent.SwipeType type);
}
