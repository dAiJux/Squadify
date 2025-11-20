package com.daijux.Squadify.service;

import com.daijux.Squadify.dto.AuthResponse;
import com.daijux.Squadify.dto.LoginRequest;
import com.daijux.Squadify.dto.RegistrationRequest;
import com.daijux.Squadify.event.UserRegistration;
import com.daijux.Squadify.kafka.RegistrationProducer;
import com.daijux.Squadify.repository.User;
import com.daijux.Squadify.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final User user;
    private final RegistrationProducer registrationProducer;
    private final ReactiveAuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    public AuthService(User user,
                       RegistrationProducer registrationProducer,
                       ReactiveAuthenticationManager authenticationManager,
                       JwtTokenProvider jwtTokenProvider,
                       PasswordEncoder passwordEncoder) {
        this.user = user;
        this.registrationProducer = registrationProducer;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    public Mono<Map<String, String>> register(RegistrationRequest request) {
        Mono<Boolean> emailExists = user.findByEmail(request.getEmail()).hasElement();
        Mono<Boolean> usernameExists = user.findByUsername(request.getUsername()).hasElement();

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
                        return Mono.just(errorDetails);
                    }

                    com.daijux.Squadify.model.User newUser = new com.daijux.Squadify.model.User();
                    newUser.setUsername(request.getUsername());
                    newUser.setEmail(request.getEmail());
                    newUser.setPassword(passwordEncoder.encode(request.getPassword()));

                    return user.save(newUser)
                            .flatMap(savedUser -> {
                                UserRegistration event = UserRegistration.builder()
                                        .username(savedUser.getUsername())
                                        .email(savedUser.getEmail())
                                        .build();

                                return registrationProducer.sendRegistrationEvent(event)
                                        .thenReturn(Map.of("message", "Inscription réussie."));
                            })
                            .onErrorResume(e -> {
                                log.error("Erreur lors de la sauvegarde synchrone de l'utilisateur {}: {}", request.getEmail(), e.getMessage());
                                return Mono.just(Map.of("error", "save_failed", "message", "Erreur serveur lors de l'enregistrement du compte."));
                            });
                });
    }

    public Mono<AuthResponse> login(LoginRequest request) {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                request.getIdentifier(),
                request.getPassword()
        );

        return authenticationManager.authenticate(auth)
                .flatMap(authenticatedAuth -> {
                    com.daijux.Squadify.model.User user = (com.daijux.Squadify.model.User) authenticatedAuth.getPrincipal();
                    String token = jwtTokenProvider.generateToken(user);

                    return Mono.just(AuthResponse.builder()
                            .token(token)
                            .userId(user.getId())
                            .username(user.getUsername())
                            .email(user.getEmail())
                            .setupCompleted(user.isSetupCompleted())
                            .build());
                })
                .onErrorResume(e -> Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides")));
    }
}