package com.daijux.Squadify.kafka;

import com.daijux.Squadify.event.MessageEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class ChatProducer {
    private static final Logger log = LoggerFactory.getLogger(ChatProducer.class);
    private static final String TOPIC_MESSAGES = "chat.messages";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public ChatProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendMessage(MessageEvent event) {
        try {
            kafkaTemplate.send(TOPIC_MESSAGES, event.getMatchId(), event);
        } catch (Exception e) {
            log.error("Erreur lors de la publication du message dans Kafka", e);
        }
    }
}
