package com.daijux.Squadify.kafka;

import com.daijux.Squadify.event.MessageEvent;
import com.daijux.Squadify.service.ChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class ChatConsumer {

    private static final Logger log = LoggerFactory.getLogger(ChatConsumer.class);
    private final ChatService chatService;

    public ChatConsumer(ChatService chatService) {
        this.chatService = chatService;
    }

    @KafkaListener(
            topics = "chat.messages",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "messageListenerContainerFactory"
    )
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