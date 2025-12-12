package com.daijux.Squadify.service;

import com.daijux.Squadify.dto.ProfileResponse;
import com.daijux.Squadify.dto.SwipeResponse;
import com.daijux.Squadify.event.SwipeEvent.SwipeType;
import com.daijux.Squadify.model.Match;
import com.daijux.Squadify.model.Profile;
import com.daijux.Squadify.model.Swipe;
import com.daijux.Squadify.repository.MatchRepository;
import com.daijux.Squadify.repository.ProfileRepository;
import com.daijux.Squadify.repository.SwipeRepository;
import com.daijux.Squadify.repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Stream;

@Service
public class MatchmakingService {

    private static final int EXCLUDE_NIN_THRESHOLD = 5000;
    private static final int FALLBACK_MULTIPLIER = 10;

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final SwipeRepository swipeRepository;
    private final MatchRepository matchRepository;
    private final ReactiveMongoTemplate mongoTemplate;

    public MatchmakingService(ProfileRepository profileRepository,
                              UserRepository userRepository,
                              SwipeRepository swipeRepository,
                              MatchRepository matchRepository,
                              ReactiveMongoTemplate mongoTemplate) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.swipeRepository = swipeRepository;
        this.matchRepository = matchRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public Flux<ProfileResponse> getCandidates(String currentUserId, int limit, String afterId) {
        return profileRepository.findByUserId(currentUserId)
                .flatMapMany(myProfile -> {
                    if (myProfile.getGames() == null || myProfile.getGames().isEmpty()) {
                        return Flux.empty();
                    }

                    Mono<List<String>> swipedIdsMono = swipeRepository.findBySwiperId(currentUserId)
                            .map(Swipe::getTargetId)
                            .collectList();

                    Mono<List<String>> matchedIdsMono = matchRepository.findByUser1IdOrUser2Id(currentUserId, currentUserId)
                            .flatMap(match -> {
                                String otherId = currentUserId.equals(match.getUser1Id())
                                        ? match.getUser2Id()
                                        : match.getUser1Id();
                                return Mono.just(otherId);
                            })
                            .collectList();

                    return Mono.zip(swipedIdsMono, matchedIdsMono)
                            .flatMapMany(tuple -> {
                                List<String> swiped = tuple.getT1();
                                List<String> matched = tuple.getT2();

                                Set<String> excludeIds = new HashSet<>();
                                excludeIds.addAll(swiped);
                                excludeIds.addAll(matched);
                                excludeIds.add(currentUserId);

                                Query baseQuery = new Query();
                                baseQuery.addCriteria(Criteria.where("games").in(myProfile.getGames()));
                                if (afterId != null && ObjectId.isValid(afterId)) {
                                    baseQuery.addCriteria(Criteria.where("_id").gt(new ObjectId(afterId)));
                                }
                                baseQuery.with(Sort.by(Sort.Direction.ASC, "_id"));

                                if (excludeIds.size() <= EXCLUDE_NIN_THRESHOLD) {
                                    baseQuery.addCriteria(Criteria.where("userId").nin(excludeIds));
                                    baseQuery.limit(limit);
                                    baseQuery.fields().include("_id").include("userId").include("games").include("schedules").include("playStyle");
                                    return mongoTemplate.find(baseQuery, Profile.class)
                                            .flatMap(profile ->
                                                    userRepository.findById(profile.getUserId())
                                                            .map(user -> ProfileResponse.builder()
                                                                    .profileId(profile.getId())
                                                                    .userId(profile.getUserId())
                                                                    .username(user.getUsername())
                                                                    .games(profile.getGames())
                                                                    .schedules(profile.getSchedules())
                                                                    .playStyle(profile.getPlayStyle())
                                                                    .build()
                                                            )
                                            );
                                } else {
                                    Query fallbackQuery = new Query();
                                    fallbackQuery.addCriteria(Criteria.where("games").in(myProfile.getGames()));
                                    if (afterId != null && ObjectId.isValid(afterId)) {
                                        fallbackQuery.addCriteria(Criteria.where("_id").gt(new ObjectId(afterId)));
                                    }
                                    fallbackQuery.with(Sort.by(Sort.Direction.ASC, "_id"));
                                    fallbackQuery.limit(limit * FALLBACK_MULTIPLIER);
                                    fallbackQuery.fields().include("_id").include("userId").include("games").include("schedules").include("playStyle");
                                    return mongoTemplate.find(fallbackQuery, Profile.class)
                                            .filter(profile -> !excludeIds.contains(profile.getUserId()))
                                            .take(limit)
                                            .flatMap(profile ->
                                                    userRepository.findById(profile.getUserId())
                                                            .map(user -> ProfileResponse.builder()
                                                                    .profileId(profile.getId())
                                                                    .userId(profile.getUserId())
                                                                    .username(user.getUsername())
                                                                    .games(profile.getGames())
                                                                    .schedules(profile.getSchedules())
                                                                    .playStyle(profile.getPlayStyle())
                                                                    .build()
                                                            )
                                            );
                                }
                            });
                });
    }

    public Mono<SwipeResponse> processSwipe(String swiperId, String targetId, SwipeType type) {
        if (swiperId == null || targetId == null || type == null) {
            return Mono.error(new IllegalArgumentException("Invalid parameters"));
        }

        Swipe swipe = new Swipe(swiperId, targetId, type);

        return swipeRepository.save(swipe)
                .onErrorResume(err -> {
                    if (err instanceof DuplicateKeyException ||
                            (err.getCause() != null && err.getCause() instanceof DuplicateKeyException)) {
                        return Mono.empty();
                    }
                    return Mono.error(err);
                })
                .flatMap(savedSwipe -> {
                    if (type == SwipeType.PASS) {
                        return Mono.just(new SwipeResponse(false, null));
                    }
                    return checkAndCreateMatch(swiperId, targetId)
                            .map(isMatch -> new SwipeResponse(isMatch, null));
                })
                .defaultIfEmpty(new SwipeResponse(false, null));
    }

    private Mono<Boolean> checkAndCreateMatch(String swiperId, String targetId) {
        return swipeRepository.findBySwiperIdAndTargetIdAndType(targetId, swiperId, SwipeType.LIKE)
                .flatMap(existingLike -> {
                    String user1Id = Stream.of(swiperId, targetId)
                            .filter(Objects::nonNull)
                            .min(String::compareTo)
                            .orElseThrow();
                    String user2Id = Stream.of(swiperId, targetId)
                            .filter(Objects::nonNull)
                            .max(String::compareTo)
                            .orElseThrow();

                    Match newMatch = new Match(user1Id, user2Id);

                    return matchRepository.save(newMatch)
                            .map(m -> true)
                            .onErrorResume(e -> Mono.just(false));
                })
                .defaultIfEmpty(false);
    }
}