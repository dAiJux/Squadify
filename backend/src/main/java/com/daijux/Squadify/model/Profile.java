package com.daijux.Squadify.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "profiles")
public class Profile {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private List<String> games;
    private List<String> schedules;
    private String playStyle;
}