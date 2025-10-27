package com.daijux.Squadify.controller;

import com.daijux.Squadify.dto.RegistrationRequest;
import com.daijux.Squadify.event.UserRegistrationEvent;
import com.daijux.Squadify.kafka.RegistrationProducer;
import com.daijux.Squadify.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class RegistrationController {
    private final RegistrationProducer registrationProducer;
    private final UserRepository userRepository;

    public RegistrationController(RegistrationProducer registrationProducer, UserRepository userRepository) {
        this.registrationProducer = registrationProducer;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public Mono<ResponseEntity<Map<String, String>>> register(@RequestBody RegistrationRequest request) {
        Mono<Boolean> emailExists = userRepository.findByEmail(request.getEmail()).hasElement();
        Mono<Boolean> usernameExists = userRepository.findByUsername(request.getUsername()).hasElement();

        return Mono.zip(emailExists, usernameExists)
                .flatMap(tuple -> {
                    boolean isEmailUsed = tuple.getT1();
                    boolean isUsernameUsed = tuple.getT2();

                    if (isEmailUsed || isUsernameUsed) {
                        Map<String, String> errorDetails = new HashMap<>();
                        if (isEmailUsed) {
                            errorDetails.put("error", "email_exists");
                            errorDetails.put("message", "Cet email est déjà utilisé.");
                        } else {
                            errorDetails.put("error", "username_exists");
                            errorDetails.put("message", "Ce nom d'utilisateur est déjà pris.");
                        }

                        return Mono.just(ResponseEntity.status(HttpStatus.CONFLICT).body(errorDetails));
                    }

                    UserRegistrationEvent event = UserRegistrationEvent.builder()
                            .username(request.getUsername())
                            .email(request.getEmail())
                            .rawPassword(request.getPassword())
                            .build();

                    return registrationProducer.sendRegistrationEvent(event)
                            .then(Mono.just(ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of("message", "Inscription en cours de traitement."))));
                });
    }
}
