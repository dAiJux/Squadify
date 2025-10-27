package com.daijux.Squadify.kafka;

import com.daijux.Squadify.event.UserRegistrationEvent;
import com.daijux.Squadify.model.User;
import com.daijux.Squadify.repository.UserRepository;
import com.mongodb.MongoWriteException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class RegistrationConsumer {
    private static final Logger log = LoggerFactory.getLogger(RegistrationConsumer.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public RegistrationConsumer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @KafkaListener(topics = "${kafka.topic.registration}", groupId = "${spring.kafka.consumer.group-id}", containerFactory = "kafkaListenerContainerFactory")
    public void consumeRegistrationEvent(UserRegistrationEvent event) {
        log.info("Événement d'inscription reçu pour l'email : {}", event.getEmail());

        String hashedPassword = passwordEncoder.encode(event.getRawPassword());

        User newUser = new User();
        newUser.setUsername(event.getUsername());
        newUser.setEmail(event.getEmail());
        newUser.setPassword(hashedPassword);
        newUser.setEnabled(false);

        Mono.defer(() -> userRepository.save(newUser))
                .doOnError(MongoWriteException.class, e -> {
                    if (e.getError().getCode() == 11000) {
                        log.warn("Tentative d'inscription doublon via Kafka pour l'utilisateur {}. Ignoré.", event.getEmail());
                    } else {
                        log.error("Erreur MongoDB inattendue lors de l'enregistrement de l'utilisateur {}: {}", event.getEmail(), e.getMessage());
                    }
                })
                .subscribe(
                        savedUser -> log.info("Utilisateur enregistré avec succès dans MongoDB: {}", savedUser.getId()),
                        error -> {},
                        () -> {}
                );
    }
}