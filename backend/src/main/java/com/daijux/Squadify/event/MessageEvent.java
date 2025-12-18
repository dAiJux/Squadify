package com.daijux.Squadify.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageEvent {
    private String id;
    private String matchId;
    private String senderId;
    private String receiverId;
    private String content;
    private LocalDateTime timestamp;
    private MessageType type;

    public enum MessageType {
        TEXT,
        TYPING,
        READ_RECEIPT
    }
}