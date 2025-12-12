package com.daijux.Squadify.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfileResponse {
    private String profileId;
    private String userId;
    private String username;
    private String email;
    private List<String> games;
    private List<String> schedules;
    private String playStyle;
}