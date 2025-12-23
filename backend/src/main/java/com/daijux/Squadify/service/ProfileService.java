package com.daijux.Squadify.service;

import com.daijux.Squadify.dto.ProfileRequest;
import com.daijux.Squadify.dto.ProfileResponse;
import com.daijux.Squadify.model.Profile;
import com.daijux.Squadify.model.User;
import com.daijux.Squadify.repository.MatchRepository;
import com.daijux.Squadify.repository.ProfileRepository;
import com.daijux.Squadify.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final MatchRepository matchRepository;

    public Mono<Profile> createOrUpdateProfile(String userId, ProfileRequest request) {
        return profileRepository.findByUserId(userId)
                .defaultIfEmpty(new Profile())
                .flatMap(p -> {
                    p.setUserId(userId);
                    p.setGames(request.getGames());
                    p.setSchedules(request.getSchedules());
                    p.setPlayStyle(request.getPlayStyle());
                    return profileRepository.save(p);
                })
                .flatMap(savedProfile -> userRepository.findById(userId)
                        .flatMap(user -> {
                            user.setSetupCompleted(true);
                            return userRepository.save(user);
                        })
                        .thenReturn(savedProfile));
    }

    public Mono<ProfileResponse> updateFullProfile(String userId, ProfileRequest request) {
        return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé")))
                .flatMap(existingUser -> {
                    Mono<Boolean> usernameCheck = Mono.just(false);
                    if (request.getUsername() != null && !request.getUsername().equals(existingUser.getUsername())) {
                        usernameCheck = userRepository.findByUsername(request.getUsername())
                                .map(u -> !u.getId().equals(userId))
                                .defaultIfEmpty(false);
                    }

                    Mono<Boolean> emailCheck = Mono.just(false);
                    if (request.getEmail() != null && !request.getEmail().equals(existingUser.getEmail())) {
                        emailCheck = userRepository.findByEmail(request.getEmail())
                                .map(u -> !u.getId().equals(userId))
                                .defaultIfEmpty(false);
                    }

                    return Mono.zip(usernameCheck, emailCheck)
                            .flatMap(tuple -> {
                                if (tuple.getT1())
                                    return Mono.error(
                                            new ResponseStatusException(HttpStatus.CONFLICT, "Pseudo déjà pris"));
                                if (tuple.getT2())
                                    return Mono.error(
                                            new ResponseStatusException(HttpStatus.CONFLICT, "Email déjà utilisé"));

                                if (request.getUsername() != null)
                                    existingUser.setUsername(request.getUsername());
                                if (request.getEmail() != null)
                                    existingUser.setEmail(request.getEmail());
                                return userRepository.save(existingUser);
                            });
                })
                .flatMap(savedUser -> profileRepository.findByUserId(userId)
                        .defaultIfEmpty(new Profile())
                        .flatMap(p -> {
                            p.setUserId(userId);
                            if (request.getGames() != null)
                                p.setGames(request.getGames());
                            if (request.getSchedules() != null)
                                p.setSchedules(request.getSchedules());
                            if (request.getPlayStyle() != null)
                                p.setPlayStyle(request.getPlayStyle());
                            return profileRepository.save(p)
                                    .map(savedProfile -> ProfileResponse.builder()
                                            .userId(savedUser.getId())
                                            .username(savedUser.getUsername())
                                            .email(savedUser.getEmail())
                                            .games(savedProfile.getGames())
                                            .schedules(savedProfile.getSchedules())
                                            .playStyle(savedProfile.getPlayStyle())
                                            .build());
                        }));
    }

    public Mono<ProfileResponse> getProfileByUserId(String userId) {
        return Mono.zip(
                userRepository.findById(userId),
                profileRepository.findByUserId(userId).defaultIfEmpty(new Profile())).map(tuple -> {
                    User u = tuple.getT1();
                    Profile p = tuple.getT2();
                    return ProfileResponse.builder()
                            .userId(u.getId())
                            .username(u.getUsername())
                            .email(u.getEmail())
                            .games(p.getGames())
                            .schedules(p.getSchedules())
                            .playStyle(p.getPlayStyle())
                            .build();
                });
    }

    public Mono<ProfileResponse> getProfileByMatchId(String matchId, String requesterId) {
        return matchRepository.findById(matchId)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Match non trouvé")))
                .flatMap(match -> {
                    if (!match.getUser1Id().equals(requesterId) && !match.getUser2Id().equals(requesterId)) {
                        log.warn("Tentative d'accès non autorisé au match: matchId={}, requester={}", matchId,
                                requesterId);
                        return Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès non autorisé"));
                    }
                    String targetUserId = match.getUser1Id().equals(requesterId)
                            ? match.getUser2Id()
                            : match.getUser1Id();
                    return getPublicProfile(targetUserId);
                });
    }

    private Mono<ProfileResponse> getPublicProfile(String userId) {
        return Mono.zip(
                userRepository.findById(userId),
                profileRepository.findByUserId(userId).defaultIfEmpty(new Profile())).map(tuple -> {
                    User u = tuple.getT1();
                    Profile p = tuple.getT2();
                    return ProfileResponse.builder()
                            .userId(u.getId())
                            .username(u.getUsername())
                            .games(p.getGames())
                            .schedules(p.getSchedules())
                            .playStyle(p.getPlayStyle())
                            .build();
                });
    }

}