package com.daijux.Squadify.controller;

import com.daijux.Squadify.dto.ProfileResponse;
import com.daijux.Squadify.dto.SwipeRequest;
import com.daijux.Squadify.dto.SwipeResponse;
import com.daijux.Squadify.repository.UserRepository;
import com.daijux.Squadify.service.MatchmakingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.security.Principal;

@RestController
@RequestMapping("/api/matchmaking")
public class MatchmakingController {

    private final MatchmakingService matchmakingService;
    private final UserRepository userRepository;

    public MatchmakingController(MatchmakingService matchmakingService, UserRepository userRepository) {
        this.matchmakingService = matchmakingService;
        this.userRepository = userRepository;
    }

    @GetMapping("/candidates")
    public Flux<ProfileResponse> getCandidates(
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String afterId,
            Principal principal) {

        if (principal == null) {
            return Flux.error(new RuntimeException("Unauthorized"));
        }

        String principalName = principal.getName();
        int safeLimit = Math.max(1, Math.min(limit, 100));

        return userRepository.findByUsername(principalName)
                .flatMapMany(user -> matchmakingService.getCandidates(user.getId(), safeLimit, afterId));
    }

    @PostMapping("/swipe")
    public Mono<ResponseEntity<SwipeResponse>> swipe(@RequestBody SwipeRequest request, Principal principal) {
        if (principal == null || request == null || request.getTargetUserId() == null || request.getType() == null) {
            return Mono.just(new ResponseEntity<>(HttpStatus.FORBIDDEN));
        }

        String principalName = principal.getName();

        return userRepository.findByUsername(principalName)
                .flatMap(user -> matchmakingService.processSwipe(user.getId(), request.getTargetUserId(), request.getType()))
                .map(response -> new ResponseEntity<>(response, HttpStatus.OK))
                .onErrorResume(e -> Mono.just(new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR)));
    }
}