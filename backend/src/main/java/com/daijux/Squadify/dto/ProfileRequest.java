package com.daijux.Squadify.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProfileRequest {
    private String username;
    private String email;
    private List<String> games;
    private List<String> schedules;
    private String playStyle;
}