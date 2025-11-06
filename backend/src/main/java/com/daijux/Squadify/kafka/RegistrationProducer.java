package com.daijux.Squadify.kafka;

import com.daijux.Squadify.event.UserRegistrationEvent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class RegistrationProducer {

    @Value("${kafka.topic.registration}")
    private String registrationTopic;

    private final KafkaTemplate<String, UserRegistrationEvent> kafkaTemplate;

    public RegistrationProducer(KafkaTemplate<String, UserRegistrationEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public Mono<Void> sendRegistrationEvent(UserRegistrationEvent event) {
        return Mono.fromRunnable(() -> kafkaTemplate.send(registrationTopic, event.getEmail(), event)).then();
    }
}