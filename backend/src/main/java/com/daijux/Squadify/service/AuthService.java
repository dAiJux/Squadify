package com.daijux.Squadify.service;

import com.daijux.Squadify.dto.AuthResponse;
import com.daijux.Squadify.dto.LoginRequest;
import com.daijux.Squadify.dto.RegistrationRequest;
import com.daijux.Squadify.event.UserRegistrationEvent;
import com.daijux.Squadify.kafka.RegistrationProducer;
import com.daijux.Squadify.model.User;
import com.daijux.Squadify.repository.UserRepository;
import com.daijux.Squadify.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RegistrationProducer registrationProducer;
    private final ReactiveAuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                       RegistrationProducer registrationProducer,
                       ReactiveAuthenticationManager authenticationManager,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.registrationProducer = registrationProducer;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public Mono<Map<String, String>> register(RegistrationRequest request) {
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
                        return Mono.just(errorDetails);
                    }

                    UserRegistrationEvent event = UserRegistrationEvent.builder()
                            .username(request.getUsername())
                            .email(request.getEmail())
                            .rawPassword(request.getPassword())
                            .build();

                    return registrationProducer.sendRegistrationEvent(event)
                            .thenReturn(Map.of("message", "Inscription en cours de traitement."));
                });
    }

    public Mono<AuthResponse> login(LoginRequest request) {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                request.getIdentifier(),
                request.getPassword()
        );

        return authenticationManager.authenticate(auth)
                .flatMap(authenticatedAuth -> {
                    User user = (User) authenticatedAuth.getPrincipal();
                    String token = jwtTokenProvider.generateToken(user);

                    return Mono.just(AuthResponse.builder()
                            .token(token)
                            .userId(user.getId())
                            .username(user.getUsername())
                            .email(user.getEmail())
                            .build());
                })
                .onErrorResume(e -> Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides")));
    }
}