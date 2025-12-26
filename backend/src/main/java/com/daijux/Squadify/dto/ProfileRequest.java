package com.daijux.Squadify.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class ProfileRequest {
    @Size(min = 3, max = 30, message = "Le nom d'utilisateur doit contenir entre 3 et 30 caractères")
    @Pattern(regexp = "^[a-zA-Z0-9_-]*$", message = "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores")
    private String username;

    @Email(message = "Format d'email invalide")
    @Size(max = 255, message = "L'email ne peut pas dépasser 255 caractères")
    private String email;

    @Size(max = 20, message = "Vous ne pouvez pas sélectionner plus de 20 jeux")
    private List<String> games;

    @Size(max = 10, message = "Vous ne pouvez pas sélectionner plus de 10 créneaux")
    private List<String> schedules;

    @Size(max = 50, message = "Le style de jeu ne peut pas dépasser 50 caractères")
    private String playStyle;
}