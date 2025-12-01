package com.daijux.Squadify.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SwipeEvent {
    private String swiperUserId;
    private String targetUserId;
    private SwipeType type;

    public enum SwipeType {
        LIKE, PASS
    }
}