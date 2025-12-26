package com.daijux.Squadify.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "L'identifiant est requis")
    @Size(max = 255, message = "L'identifiant ne peut pas dépasser 255 caractères")
    private String identifier;

    @NotBlank(message = "Le mot de passe est requis")
    @Size(max = 128, message = "Le mot de passe ne peut pas dépasser 128 caractères")
    private String password;
}