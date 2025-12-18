package com.daijux.Squadify.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageResponse {
    private String id;
    private String matchId;
    private String senderId;
    private String senderUsername;
    private String content;
    private LocalDateTime timestamp;
    private boolean read;
}