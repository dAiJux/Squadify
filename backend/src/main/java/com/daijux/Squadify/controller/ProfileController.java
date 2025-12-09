package com.daijux.Squadify.controller;

import com.daijux.Squadify.dto.ProfileRequest;
import com.daijux.Squadify.dto.ProfileResponse;
import com.daijux.Squadify.model.User;
import com.daijux.Squadify.service.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @PostMapping("/setup/{userId}")
    public Mono<ResponseEntity<com.daijux.Squadify.model.Profile>> setupProfile(@PathVariable String userId, @RequestBody ProfileRequest request) {
        return profileService.createOrUpdateProfile(userId, request)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/{userId}")
    public Mono<ResponseEntity<ProfileResponse>> getProfile(@PathVariable String userId) {
        return profileService.getProfileByUserId(userId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}")
    public Mono<ResponseEntity<ProfileResponse>> updateProfile(
            @PathVariable String userId,
            @RequestBody ProfileRequest request,
            @AuthenticationPrincipal User user) {

        if (!user.getId().equals(userId)) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
        }

        return profileService.updateFullProfile(userId, request)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.CONFLICT).build()));
    }
}