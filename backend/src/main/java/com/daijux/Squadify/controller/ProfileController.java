package com.daijux.Squadify.controller;

import com.daijux.Squadify.dto.ProfileRequest;
import com.daijux.Squadify.dto.ProfileResponse;
import com.daijux.Squadify.model.Profile;
import com.daijux.Squadify.model.User;
import com.daijux.Squadify.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class ProfileController {

        private final ProfileService profileService;

        @PostMapping("/setup")
        public Mono<ResponseEntity<Profile>> setupProfile(@Valid @RequestBody ProfileRequest request,
                        @AuthenticationPrincipal User user) {
                return profileService.createOrUpdateProfile(user.getId(), request)
                                .map(ResponseEntity::ok);
        }

        @GetMapping("/me")
        public Mono<ResponseEntity<ProfileResponse>> getMyProfile(@AuthenticationPrincipal User user) {
                return profileService.getProfileByUserId(user.getId())
                                .map(ResponseEntity::ok)
                                .defaultIfEmpty(ResponseEntity.notFound().build());
        }

        @GetMapping("/view/{matchId}")
        public Mono<ResponseEntity<ProfileResponse>> viewMatchProfile(
                        @PathVariable String matchId,
                        @AuthenticationPrincipal User user) {
                return profileService.getProfileByMatchId(matchId, user.getId())
                                .map(ResponseEntity::ok)
                                .defaultIfEmpty(ResponseEntity.notFound().build());
        }

        @PutMapping("/")
        public Mono<ResponseEntity<ProfileResponse>> updateProfile(
                        @Valid @RequestBody ProfileRequest request,
                        @AuthenticationPrincipal User user) {
                return profileService.updateFullProfile(user.getId(), request)
                                .map(ResponseEntity::ok)
                                .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.CONFLICT).build()));
        }
}