package com.daijux.Squadify.dto;

import com.daijux.Squadify.event.MessageEvent;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequest {
    private String receiverId;
    private String content;
    private MessageEvent.MessageType type;
}