package com.daijux.Squadify.controller;

import com.daijux.Squadify.dto.ProfileResponse;
import com.daijux.Squadify.dto.SwipeRequest;
import com.daijux.Squadify.dto.SwipeResponse;
import com.daijux.Squadify.model.User;
import com.daijux.Squadify.service.MatchmakingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/matchmaking")
@RequiredArgsConstructor
public class MatchmakingController {

    private final MatchmakingService matchmakingService;

    @GetMapping("/candidates")
    public Flux<ProfileResponse> getCandidates(
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String afterId,
            @AuthenticationPrincipal User user) {

        int safeLimit = Math.max(1, Math.min(limit, 100));
        return matchmakingService.getCandidates(user.getId(), safeLimit, afterId);
    }

    @PostMapping("/swipe")
    public Mono<ResponseEntity<SwipeResponse>> swipe(
            @Valid @RequestBody SwipeRequest request,
            @AuthenticationPrincipal User user) {
        return matchmakingService.processSwipe(user.getId(), request.getTargetUserId(), request.getType())
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()));
    }
}