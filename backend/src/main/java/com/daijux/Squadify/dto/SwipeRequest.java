package com.daijux.Squadify.dto;

import com.daijux.Squadify.event.SwipeEvent.SwipeType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SwipeRequest {
    private String targetUserId;
    private SwipeType type;
}
