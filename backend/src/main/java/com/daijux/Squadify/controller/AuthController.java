package com.daijux.Squadify.controller;

import com.daijux.Squadify.dto.AuthResponse;
import com.daijux.Squadify.dto.LoginRequest;
import com.daijux.Squadify.dto.RegistrationRequest;
import com.daijux.Squadify.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public Mono<ResponseEntity<Map<String, String>>> register(@RequestBody RegistrationRequest request) {
        return authService.register(request)
                .map(response -> {
                    if (response.containsKey("error")) {
                        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
                    }
                    return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
                });
    }

    @PostMapping("/login")
    public Mono<AuthResponse> login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}