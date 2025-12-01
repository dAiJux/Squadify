package com.daijux.Squadify.kafka;

import com.daijux.Squadify.event.SwipeEvent;
import com.daijux.Squadify.service.MatchmakingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class SwipeConsumer {

    private static final Logger log = LoggerFactory.getLogger(SwipeConsumer.class);

    private final MatchmakingService matchmakingService;

    public SwipeConsumer(MatchmakingService matchmakingService) {
        this.matchmakingService = matchmakingService;
    }

    @KafkaListener(topics = "user.swipes", groupId = "${spring.kafka.consumer.group-id}", containerFactory = "swipeListenerContainerFactory")
    public void consumeSwipeEvent(SwipeEvent event) {
        log.info("⚡ Action reçue : L'utilisateur {} a {} l'utilisateur {}. Démarrage du traitement asynchrone...",
                event.getSwiperUserId(),
                event.getType(),
                event.getTargetUserId()
        );

        matchmakingService.processAndSaveSwipe(event)
                .doOnError(error -> log.error("❌ Erreur lors du traitement du SwipeEvent pour le match: {}", error.getMessage()))
                .doFinally(sig -> log.info("✅ Traitement du swipe vers {} finalisé.", event.getTargetUserId()))
                .subscribe();
    }
}