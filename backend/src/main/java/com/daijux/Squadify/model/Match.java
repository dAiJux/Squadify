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
@Document(collection = "matches")
@CompoundIndex(def = "{'user1Id': 1, 'user2Id': 1}", unique = true)
public class Match {

    @Id
    private String id;
    private String user1Id;
    private String user2Id;
    private LocalDateTime matchDate = LocalDateTime.now();
    private boolean isActive = true;

    public Match(String user1Id, String user2Id) {
        this.user1Id = user1Id;
        this.user2Id = user2Id;
    }
}