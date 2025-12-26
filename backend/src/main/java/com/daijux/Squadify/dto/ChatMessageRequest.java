package com.daijux.Squadify.dto;

import com.daijux.Squadify.event.MessageEvent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequest {
    @NotBlank(message = "L'ID du destinataire est requis")
    private String receiverId;

    @Size(max = 5000, message = "Le message ne peut pas dépasser 5000 caractères")
    private String content;

    @NotNull(message = "Le type de message est requis")
    private MessageEvent.MessageType type;
}