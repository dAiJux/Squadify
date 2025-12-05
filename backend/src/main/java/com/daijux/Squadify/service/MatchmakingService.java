package com.daijux.Squadify.service;

import com.daijux.Squadify.dto.ProfileResponse;
import com.daijux.Squadify.event.SwipeEvent;
import com.daijux.Squadify.event.SwipeEvent.SwipeType;
import com.daijux.Squadify.repository.Profile;
import com.daijux.Squadify.repository.User;
import com.daijux.Squadify.repository.Swipe;
import com.daijux.Squadify.repository.Match;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Objects;
import java.util.stream.Stream;

@Service
public class MatchmakingService {

    private static final Logger log = LoggerFactory.getLogger(MatchmakingService.class);

    private final Profile ProfileRepo;
    private final User UserRepo;
    private final Swipe SwipeRepo;
    private final Match MatchRepo;

    private final ReactiveMongoTemplate mongoTemplate;
    private final KafkaTemplate<String, SwipeEvent> kafkaTemplate;

    private static final String TOPIC_SWIPES = "user.swipes";

    public MatchmakingService(Profile ProfileRepo, User UserRepo, Swipe SwipeRepo, Match MatchRepo, ReactiveMongoTemplate mongoTemplate, KafkaTemplate<String, SwipeEvent> kafkaTemplate) {
        this.ProfileRepo = ProfileRepo;
        this.UserRepo = UserRepo;
        this.SwipeRepo = SwipeRepo;
        this.MatchRepo = MatchRepo;
        this.mongoTemplate = mongoTemplate;
        this.kafkaTemplate = kafkaTemplate;
    }

    public Flux<ProfileResponse> getCandidates(String currentUserId) {
        return ProfileRepo.findByUserId(currentUserId)
                .flatMapMany(myProfile -> {
                    if (myProfile.getGames() == null || myProfile.getGames().isEmpty()) {
                        return Flux.empty();
                    }

                    Query query = new Query();
                    query.addCriteria(Criteria.where("games").in(myProfile.getGames()));
                    query.addCriteria(Criteria.where("userId").ne(currentUserId));
                    query.limit(20);

                    return mongoTemplate.find(query, com.daijux.Squadify.model.Profile.class)
                            .flatMap(profile ->
                                    UserRepo.findById(profile.getUserId())
                                            .map(user -> ProfileResponse.builder()
                                                    .userId(profile.getUserId())
                                                    .username(user.getUsername())
                                                    .games(profile.getGames())
                                                    .schedules(profile.getSchedules())
                                                    .playStyle(profile.getPlayStyle())
                                                    .build()
                                            )
                            );
                });
    }

    public void processSwipe(String swiperId, String targetId, SwipeType type) {
        SwipeEvent event = SwipeEvent.builder()
                .swiperUserId(swiperId)
                .targetUserId(targetId)
                .type(type)
                .build();

        kafkaTemplate.send(TOPIC_SWIPES, swiperId, event);
    }

    public Mono<Void> processAndSaveSwipe(SwipeEvent event) {
        if (event.getType() == SwipeType.PASS) {
            com.daijux.Squadify.model.Swipe swipe = new com.daijux.Squadify.model.Swipe(event.getSwiperUserId(), event.getTargetUserId(), SwipeType.PASS);
            return SwipeRepo.save(swipe).then();
        }

        com.daijux.Squadify.model.Swipe newSwipe = new com.daijux.Squadify.model.Swipe(event.getSwiperUserId(), event.getTargetUserId(), SwipeType.LIKE);
        Mono<com.daijux.Squadify.model.Swipe> saveSwipe = SwipeRepo.save(newSwipe);
        Mono<com.daijux.Squadify.model.Swipe> reciprocalSwipe = SwipeRepo.findBySwiperIdAndTargetIdAndType(
                event.getTargetUserId(),
                event.getSwiperUserId(),
                SwipeType.LIKE
        );

        return saveSwipe.then(reciprocalSwipe)
                .flatMap(existingLike -> {
                    String user1Id = Stream.of(event.getSwiperUserId(), event.getTargetUserId())
                            .filter(Objects::nonNull)
                            .min(String::compareTo)
                            .orElseThrow();
                    String user2Id = Stream.of(event.getSwiperUserId(), event.getTargetUserId())
                            .filter(Objects::nonNull)
                            .max(String::compareTo)
                            .orElseThrow();

                    com.daijux.Squadify.model.Match newMatch = new com.daijux.Squadify.model.Match(user1Id, user2Id);
                    return MatchRepo.save(newMatch).then();
                })
                .onErrorResume(e -> {
                    if (e instanceof java.util.NoSuchElementException) {
                        log.info("Aucun match trouvé pour {} -> {}.",
                                event.getSwiperUserId() != null ? event.getSwiperUserId().substring(0, 6) : "null",
                                event.getTargetUserId() != null ? event.getTargetUserId().substring(0, 6) : "null");
                        return Mono.empty();
                    }
                    log.error("Erreur critique lors du traitement du match : {}", e.getMessage());
                    return Mono.empty();
                })
                .then();
    }
}
