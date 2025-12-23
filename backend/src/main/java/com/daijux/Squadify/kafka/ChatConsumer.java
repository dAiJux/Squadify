package com.daijux.Squadify.kafka;

import com.daijux.Squadify.event.MessageEvent;
import com.daijux.Squadify.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatConsumer {

    private final ChatService chatService;

    @KafkaListener(topics = "chat.messages", groupId = "${spring.kafka.consumer.group-id}", containerFactory = "messageListenerContainerFactory")
    public void consumeMessage(MessageEvent event) {
        if (event.getType() == MessageEvent.MessageType.TEXT) {
            chatService.saveMessage(event)
                    .doOnSuccess(savedMessage -> log.debug("Message sauvegardé et diffusé"))
                    .doOnError(error -> log.error("Erreur lors du traitement du message TEXT"))
                    .subscribe();
        } else if (event.getType() == MessageEvent.MessageType.READ_RECEIPT) {
            chatService.markMessagesAsRead(event.getMatchId(), event.getSenderId())
                    .doOnError(error -> log.error("Erreur lors du marquage des messages comme lus"))
                    .subscribe();
            chatService.broadcastEvent(event);
        } else if (event.getType() == MessageEvent.MessageType.TYPING) {
            chatService.broadcastEvent(event);
        }
    }
}