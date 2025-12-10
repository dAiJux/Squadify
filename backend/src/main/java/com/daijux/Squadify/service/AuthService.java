package com.daijux.Squadify.service;

import com.daijux.Squadify.dto.AuthResponse;
import com.daijux.Squadify.dto.ChangePasswordRequest;
import com.daijux.Squadify.dto.LoginRequest;
import com.daijux.Squadify.dto.RegistrationRequest;
import com.daijux.Squadify.model.User;
import com.daijux.Squadify.repository.MatchRepository;
import com.daijux.Squadify.repository.ProfileRepository;
import com.daijux.Squadify.repository.SwipeRepository;
import com.daijux.Squadify.repository.UserRepository;
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

import java.util.Map;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final MatchRepository matchRepository;
    private final SwipeRepository swipeRepository;
    private final ReactiveAuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       ProfileRepository profileRepository,
                       MatchRepository matchRepository,
                       SwipeRepository swipeRepository,
                       ReactiveAuthenticationManager authenticationManager,
                       JwtTokenProvider jwtTokenProvider,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.matchRepository = matchRepository;
        this.swipeRepository = swipeRepository;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    public Mono<Map<String, String>> register(RegistrationRequest request) {
        Mono<Boolean> emailExists = userRepository.findByEmail(request.getEmail()).hasElement();
        Mono<Boolean> usernameExists = userRepository.findByUsername(request.getUsername()).hasElement();

        return Mono.zip(emailExists, usernameExists)
                .flatMap(tuple -> {
                    boolean isEmailUsed = tuple.getT1();
                    boolean isUsernameUsed = tuple.getT2();

                    if (isEmailUsed) {
                        return Mono.error(new ResponseStatusException(HttpStatus.CONFLICT, "Cet email est déjà utilisé."));
                    }
                    if (isUsernameUsed) {
                        return Mono.error(new ResponseStatusException(HttpStatus.CONFLICT, "Ce nom d'utilisateur est déjà pris."));
                    }

                    User newUser = new User();
                    newUser.setUsername(request.getUsername());
                    newUser.setEmail(request.getEmail());
                    newUser.setPassword(passwordEncoder.encode(request.getPassword()));

                    return userRepository.save(newUser)
                            .map(savedUser -> Map.of("message", "Inscription réussie."))
                            .doOnError(e -> log.error("Erreur lors de l'enregistrement d'un utilisateur"))
                            .onErrorResume(e -> Mono.error(new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur serveur lors de l'enregistrement du compte.")));
                });
    }

    public Mono<AuthResponse> login(LoginRequest request) {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                request.getIdentifier(),
                request.getPassword()
        );

        return authenticationManager.authenticate(auth)
                .flatMap(authenticatedAuth -> {
                    User userModel = (User) authenticatedAuth.getPrincipal();
                    String token = jwtTokenProvider.generateToken(userModel);

                    return Mono.just(AuthResponse.builder()
                            .token(token)
                            .userId(userModel.getId())
                            .username(userModel.getUsername())
                            .email(userModel.getEmail())
                            .setupCompleted(userModel.isSetupCompleted())
                            .build());
                })
                .onErrorResume(e -> Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides")));
    }

    public Mono<AuthResponse> validateAndGetUser(String token) {
        if (!jwtTokenProvider.validateToken(token)) return Mono.empty();
        String userId = jwtTokenProvider.getUserIdFromToken(token);
        return userRepository.findById(userId)
                .map(u -> AuthResponse.builder()
                        .userId(u.getId())
                        .username(u.getUsername())
                        .email(u.getEmail())
                        .setupCompleted(u.isSetupCompleted())
                        .build());
    }

    public Mono<Void> changePassword(String userId, ChangePasswordRequest request) {
        return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable")))
                .flatMap(u -> {
                    if (!passwordEncoder.matches(request.getCurrentPassword(), u.getPassword())) {
                        return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Mot de passe actuel incorrect"));
                    }
                    u.setPassword(passwordEncoder.encode(request.getNewPassword()));
                    return userRepository.save(u);
                })
                .then();
    }

    public Mono<Void> deleteAccount(String userId, String password) {
        return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable")))
                .flatMap(u -> {
                    if (!passwordEncoder.matches(password, u.getPassword())) {
                        return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Mot de passe incorrect"));
                    }

                    return profileRepository.deleteByUserId(userId)
                            .then(matchRepository.deleteByUser1IdOrUser2Id(userId, userId))
                            .then(swipeRepository.deleteBySwiperIdOrTargetId(userId, userId))
                            .then(userRepository.deleteById(userId))
                            .doOnError(e -> log.error("Erreur lors de la suppression du compte"));
                });
    }
}