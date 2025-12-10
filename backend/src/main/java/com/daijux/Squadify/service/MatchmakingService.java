package com.daijux.Squadify.service;

import com.daijux.Squadify.dto.ProfileResponse;
import com.daijux.Squadify.event.SwipeEvent;
import com.daijux.Squadify.event.SwipeEvent.SwipeType;
import com.daijux.Squadify.model.Match;
import com.daijux.Squadify.model.Profile;
import com.daijux.Squadify.model.Swipe;
import com.daijux.Squadify.repository.MatchRepository;
import com.daijux.Squadify.repository.ProfileRepository;
import com.daijux.Squadify.repository.SwipeRepository;
import com.daijux.Squadify.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Objects;
import java.util.stream.Stream;

@Service
public class MatchmakingService {

    private static final Logger log = LoggerFactory.getLogger(MatchmakingService.class);

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final SwipeRepository swipeRepository;
    private final MatchRepository matchRepository;

    private final ReactiveMongoTemplate mongoTemplate;
    private final KafkaTemplate<String, SwipeEvent> kafkaTemplate;

    private static final String TOPIC_SWIPES = "user.swipes";

    public MatchmakingService(ProfileRepository profileRepository,
                              UserRepository userRepository,
                              SwipeRepository swipeRepository,
                              MatchRepository matchRepository,
                              ReactiveMongoTemplate mongoTemplate,
                              KafkaTemplate<String, SwipeEvent> kafkaTemplate) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.swipeRepository = swipeRepository;
        this.matchRepository = matchRepository;
        this.mongoTemplate = mongoTemplate;
        this.kafkaTemplate = kafkaTemplate;
    }

    public Flux<ProfileResponse> getCandidates(String currentUserId) {
        return profileRepository.findByUserId(currentUserId)
                .flatMapMany(myProfile -> {
                    if (myProfile.getGames() == null || myProfile.getGames().isEmpty()) {
                        return Flux.empty();
                    }

                    Query query = new Query();
                    query.addCriteria(Criteria.where("games").in(myProfile.getGames()));
                    query.addCriteria(Criteria.where("userId").ne(currentUserId));
                    query.limit(20);

                    return mongoTemplate.find(query, Profile.class)
                            .flatMap(profile ->
                                    userRepository.findById(profile.getUserId())
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
            Swipe swipe = new Swipe(event.getSwiperUserId(), event.getTargetUserId(), SwipeType.PASS);
            return swipeRepository.save(swipe).then();
        }

        Swipe newSwipe = new Swipe(event.getSwiperUserId(), event.getTargetUserId(), SwipeType.LIKE);
        Mono<Swipe> saveSwipe = swipeRepository.save(newSwipe);
        Mono<Swipe> reciprocalSwipe = swipeRepository.findBySwiperIdAndTargetIdAndType(
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

                    Match newMatch = new Match(user1Id, user2Id);
                    return matchRepository.save(newMatch).then();
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