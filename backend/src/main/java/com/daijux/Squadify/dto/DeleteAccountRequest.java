package com.daijux.Squadify.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DeleteAccountRequest {
    @NotBlank(message = "Le mot de passe est requis")
    private String password;
}