package com.daijux.Squadify.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String userId;
    private String username;
}