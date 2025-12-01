package com.daijux.Squadify.kafka;

import com.daijux.Squadify.event.SwipeEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class SwipeProducer {

    private static final String TOPIC_SWIPES = "user.swipes";

    private final KafkaTemplate<String, SwipeEvent> kafkaTemplate;

    public SwipeProducer(KafkaTemplate<String, SwipeEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendSwipeEvent(SwipeEvent event) {
        kafkaTemplate.send(TOPIC_SWIPES, event.getSwiperUserId(), event);
    }
}