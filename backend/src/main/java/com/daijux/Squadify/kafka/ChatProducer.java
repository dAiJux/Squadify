package com.daijux.Squadify.kafka;

import com.daijux.Squadify.event.MessageEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatProducer {

    private static final String TOPIC_MESSAGES = "chat.messages";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendMessage(MessageEvent event) {
        try {
            kafkaTemplate.send(TOPIC_MESSAGES, event.getMatchId(), event);
        } catch (Exception e) {
            log.error("Erreur lors de la publication du message dans Kafka", e);
        }
    }
}
