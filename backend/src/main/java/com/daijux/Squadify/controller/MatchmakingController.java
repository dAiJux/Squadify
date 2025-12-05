package com.daijux.Squadify.controller;

import com.daijux.Squadify.dto.ProfileResponse;
import com.daijux.Squadify.event.SwipeEvent;
import com.daijux.Squadify.service.MatchmakingService;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/matchmaking")
public class MatchmakingController {

    private final MatchmakingService matchmakingService;

    public MatchmakingController(MatchmakingService matchmakingService) {
        this.matchmakingService = matchmakingService;
    }

    @GetMapping("/candidates/{userId}")
    public Flux<ProfileResponse> getCandidates(@PathVariable String userId) {
        return matchmakingService.getCandidates(userId);
    }

    @PostMapping("/swipe")
    public Mono<Void> swipe(@RequestBody SwipeEvent swipeEvent) {
        return matchmakingService.processAndSaveSwipe(swipeEvent);
    }
}
