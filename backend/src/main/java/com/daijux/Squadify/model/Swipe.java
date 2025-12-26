package com.daijux.Squadify.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "swipes")
@CompoundIndex(def = "{'swiperId': 1, 'targetId': 1}", unique = true)
public class Swipe {

    public enum SwipeType {
        LIKE, PASS
    }

    @Id
    private String id;
    private String swiperId;
    private String targetId;
    private SwipeType type;
    private LocalDateTime timestamp = LocalDateTime.now();

    public Swipe(String swiperId, String targetId, SwipeType type) {
        this.swiperId = swiperId;
        this.targetId = targetId;
        this.type = type;
    }
}