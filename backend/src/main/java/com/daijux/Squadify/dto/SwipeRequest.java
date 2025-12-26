package com.daijux.Squadify.dto;

import com.daijux.Squadify.model.Swipe.SwipeType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SwipeRequest {
    @NotBlank(message = "L'ID de l'utilisateur cible est requis")
    private String targetUserId;

    @NotNull(message = "Le type de swipe est requis")
    private SwipeType type;
}
