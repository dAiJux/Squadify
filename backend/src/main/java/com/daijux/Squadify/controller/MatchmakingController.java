package com.daijux.Squadify.controller;

import com.daijux.Squadify.dto.ProfileResponse;
import com.daijux.Squadify.event.SwipeEvent;
import com.daijux.Squadify.service.MatchmakingService;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

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
    public void swipe(@RequestBody SwipeEvent swipeEvent) {
        matchmakingService.processSwipe(
                swipeEvent.getSwiperUserId(),
                swipeEvent.getTargetUserId(),
                swipeEvent.getType()
        );
    }
}