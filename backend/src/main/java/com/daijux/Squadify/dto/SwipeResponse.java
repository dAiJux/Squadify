package com.daijux.Squadify.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SwipeResponse {
    private boolean match;
    private String matchId;
}