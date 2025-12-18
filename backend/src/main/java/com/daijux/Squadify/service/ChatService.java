package com.daijux.Squadify.service;

import com.daijux.Squadify.dto.ChatMessageResponse;
import com.daijux.Squadify.dto.ConversationResponse;
import com.daijux.Squadify.event.MessageEvent;
import com.daijux.Squadify.kafka.ChatProducer;
import com.daijux.Squadify.model.Message;
import com.daijux.Squadify.repository.MatchRepository;
import com.daijux.Squadify.repository.MessageRepository;
import com.daijux.Squadify.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.stream.Stream;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final MessageRepository messageRepository;
    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final ChatProducer kafkaProducer;
    private final Sinks.Many<MessageEvent> chatSink;

    public ChatService(MessageRepository messageRepository,
                       MatchRepository matchRepository,
                       UserRepository userRepository,
                       ChatProducer kafkaProducer) {
        this.messageRepository = messageRepository;
        this.matchRepository = matchRepository;
        this.userRepository = userRepository;
        this.kafkaProducer = kafkaProducer;
        this.chatSink = Sinks.many().multicast().onBackpressureBuffer();
    }

    private Mono<Void> checkMatchAccess(String matchId, String userId) {
        String[] parts = matchId.split("-");
        if (parts.length != 2) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST));
        }
        if (userId.equals(parts[0]) || userId.equals(parts[1])) {
            return Mono.empty();
        }
        log.warn("Tentative d'accès non autorisé à une conversation");
        return Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN));
    }

    public Mono<ConversationResponse> getConversationInfo(String matchId, String userId) {
        return checkMatchAccess(matchId, userId)
                .then(Mono.defer(() -> {
                    String[] parts = matchId.split("-");
                    String otherUserId = userId.equals(parts[0]) ? parts[1] : parts[0];
                    return userRepository.findById(otherUserId)
                            .map(u -> ConversationResponse.builder()
                                    .matchId(matchId)
                                    .otherUserId(otherUserId)
                                    .otherUsername(u.getUsername())
                                    .build());
                }));
    }

    public Flux<ConversationResponse> getUserConversations(String userId) {
        return matchRepository.findByUser1IdOrUser2Id(userId, userId)
                .flatMap(match -> {
                    String otherId = userId.equals(match.getUser1Id()) ? match.getUser2Id() : match.getUser1Id();
                    String matchId = generateMatchId(match.getUser1Id(), match.getUser2Id());
                    return userRepository.findById(otherId)
                            .flatMap(otherUser -> {
                                Mono<Message> lastMsgMono = messageRepository.findFirstByMatchIdOrderByTimestampDesc(matchId);
                                Mono<Long> unreadMono = messageRepository.countByMatchIdAndReceiverIdAndReadFalse(matchId, userId);
                                return Mono.zip(lastMsgMono.defaultIfEmpty(new Message()), unreadMono)
                                        .map(t -> ConversationResponse.builder()
                                                .matchId(matchId)
                                                .otherUserId(otherId)
                                                .otherUsername(otherUser.getUsername())
                                                .lastMessage(t.getT1().getContent())
                                                .lastMessageTime(t.getT1().getTimestamp())
                                                .unreadCount(t.getT2().intValue())
                                                .matchDate(match.getMatchDate())
                                                .build());
                            });
                })
                .sort((c1, c2) -> {
                    LocalDateTime t1 = c1.getLastMessageTime() != null ? c1.getLastMessageTime() : c1.getMatchDate();
                    LocalDateTime t2 = c2.getLastMessageTime() != null ? c2.getLastMessageTime() : c2.getMatchDate();
                    if (t1 == null) return 1;
                    if (t2 == null) return -1;
                    return t2.compareTo(t1);
                });
    }

    public Flux<ChatMessageResponse> getConversationMessages(String matchId, String userId) {
        return checkMatchAccess(matchId, userId)
                .thenMany(messageRepository.findByMatchIdOrderByTimestampAsc(matchId))
                .sort(Comparator.comparing(Message::getTimestamp))
                .flatMap(m -> userRepository.findById(m.getSenderId())
                        .map(s -> ChatMessageResponse.builder()
                                .id(m.getId())
                                .matchId(m.getMatchId())
                                .senderId(m.getSenderId())
                                .senderUsername(s.getUsername())
                                .content(m.getContent())
                                .timestamp(m.getTimestamp())
                                .read(m.isRead())
                                .build()));
    }

    public Flux<MessageEvent> subscribeToMessages(String userId) {
        return this.chatSink.asFlux()
                .filter(e -> e.getReceiverId().equals(userId) || e.getSenderId().equals(userId))
                .doOnNext(e -> log.debug("Diffusion d'un événement via SSE"));
    }

    public Mono<Void> sendMessage(String matchId, String senderId, String receiverId, String content, MessageEvent.MessageType type) {
        return checkMatchAccess(matchId, senderId)
                .then(Mono.fromRunnable(() -> {
                    MessageEvent event = MessageEvent.builder()
                            .matchId(matchId)
                            .senderId(senderId)
                            .receiverId(receiverId)
                            .content(content != null ? content.trim() : null)
                            .timestamp(LocalDateTime.now(ZoneId.of("Europe/Paris")))
                            .type(type != null ? type : MessageEvent.MessageType.TEXT)
                            .build();
                    kafkaProducer.sendMessage(event);
                    log.debug("Message publié dans Kafka");
                }));
    }

    public Mono<Message> saveMessage(MessageEvent event) {
        Message message = Message.builder()
                .matchId(event.getMatchId())
                .senderId(event.getSenderId())
                .receiverId(event.getReceiverId())
                .content(event.getContent())
                .timestamp(event.getTimestamp())
                .read(false)
                .build();

        return messageRepository.save(message)
                .doOnSuccess(savedMessage -> {
                    event.setId(savedMessage.getId());
                    log.debug("Message sauvegardé avec ID: {}", savedMessage.getId());
                    this.chatSink.tryEmitNext(event);
                    log.debug("Événement TEXT diffusé via SSE");
                })
                .doOnError(e -> log.error("Erreur lors de la sauvegarde du message"));
    }

    public Mono<Void> markMessagesAsRead(String matchId, String userId) {
        return checkMatchAccess(matchId, userId)
                .thenMany(messageRepository.findByMatchIdAndReceiverIdAndReadFalse(matchId, userId)
                        .flatMap(m -> {
                            m.setRead(true);
                            return messageRepository.save(m);
                        }))
                .then()
                .doOnSuccess(v -> log.debug("Messages marqués comme lus"));
    }

    public void broadcastEvent(MessageEvent event) {
        Sinks.EmitResult result = this.chatSink.tryEmitNext(event);
        if (result.isFailure()) {
            log.warn("Échec de l'émission de l'événement: {}", result);
        } else {
            log.debug("Événement {} diffusé avec succès", event.getType());
        }
    }

    private String generateMatchId(String u1, String u2) {
        String min = Stream.of(u1, u2).min(String::compareTo).orElseThrow();
        String max = Stream.of(u1, u2).max(String::compareTo).orElseThrow();
        return min + "-" + max;
    }
}