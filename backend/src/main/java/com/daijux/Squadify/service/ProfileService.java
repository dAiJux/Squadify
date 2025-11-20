package com.daijux.Squadify.service;

import com.daijux.Squadify.dto.ProfileRequest;
import com.daijux.Squadify.repository.User;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class ProfileService {

    private final com.daijux.Squadify.repository.Profile profile;
    private final User user;

    public ProfileService(com.daijux.Squadify.repository.Profile profile, User user) {
        this.profile = profile;
        this.user = user;
    }

    public Mono<com.daijux.Squadify.model.Profile> createOrUpdateProfile(String userId, ProfileRequest request) {
        com.daijux.Squadify.model.Profile profile = new com.daijux.Squadify.model.Profile();
        profile.setUserId(userId);
        profile.setGames(request.getGames());
        profile.setSchedules(request.getSchedules());
        profile.setPlayStyle(request.getPlayStyle());

        return this.profile.save(profile)
                .flatMap(savedProfile -> user.findById(userId)
                        .flatMap(user -> {
                            user.setSetupCompleted(true);
                            return this.user.save(user);
                        })
                        .thenReturn(savedProfile));
    }

    public Mono<com.daijux.Squadify.model.Profile> getProfileByUserId(String userId) {
        return profile.findByUserId(userId);
    }
}