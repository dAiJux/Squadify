package com.daijux.Squadify.controller;

import com.daijux.Squadify.dto.ChatMessageRequest;
import com.daijux.Squadify.dto.ChatMessageResponse;
import com.daijux.Squadify.dto.ConversationResponse;
import com.daijux.Squadify.event.MessageEvent;
import com.daijux.Squadify.model.User;
import com.daijux.Squadify.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/{matchId}/info")
    public Mono<ConversationResponse> getConversationInfo(
            @PathVariable String matchId,
            @AuthenticationPrincipal User user) {
        return chatService.getConversationInfo(matchId, user.getId());
    }

    @GetMapping("/conversations")
    public Flux<ConversationResponse> getConversations(@AuthenticationPrincipal User user) {
        return chatService.getUserConversations(user.getId());
    }

    @GetMapping("/{matchId}/messages")
    public Flux<ChatMessageResponse> getMessages(
            @PathVariable String matchId,
            @AuthenticationPrincipal User user) {
        return chatService.getConversationMessages(matchId, user.getId());
    }

    @PostMapping("/{matchId}/send")
    public Mono<ResponseEntity<Void>> sendMessage(
            @PathVariable String matchId,
            @Valid @RequestBody ChatMessageRequest request,
            @AuthenticationPrincipal User user) {
        return chatService.sendMessage(
                matchId,
                user.getId(),
                request.getReceiverId(),
                request.getContent(),
                request.getType()).then(Mono.just(ResponseEntity.ok().build()));
    }

    @PostMapping("/{matchId}/read")
    public Mono<ResponseEntity<Void>> markAsRead(
            @PathVariable String matchId,
            @AuthenticationPrincipal User user) {
        return chatService.markMessagesAsRead(matchId, user.getId())
                .then(Mono.just(ResponseEntity.ok().build()));
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<MessageEvent> streamMessages(@AuthenticationPrincipal User user) {
        return chatService.subscribeToMessages(user.getId());
    }
}