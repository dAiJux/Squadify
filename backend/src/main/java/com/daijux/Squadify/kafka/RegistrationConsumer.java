package com.daijux.Squadify.kafka;

import com.daijux.Squadify.event.UserRegistration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class RegistrationConsumer {
    private static final Logger log = LoggerFactory.getLogger(RegistrationConsumer.class);

    public RegistrationConsumer() {
    }

    @KafkaListener(topics = "${kafka.topic.registration}", groupId = "${spring.kafka.consumer.group-id}", containerFactory = "kafkaListenerContainerFactory")
    public void consumeRegistrationEvent(UserRegistration event) {
        log.info("Événement de post-inscription reçu pour l'utilisateur: {}. Démarrage des tâches asynchrones.", event.getEmail());

        log.info("Tâches asynchrones terminées pour l'utilisateur {}", event.getEmail());
    }
}