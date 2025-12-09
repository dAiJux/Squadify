package com.daijux.Squadify.controller;

import com.daijux.Squadify.dto.AuthResponse;
import com.daijux.Squadify.dto.ChangePasswordRequest;
import com.daijux.Squadify.dto.DeleteAccountRequest;
import com.daijux.Squadify.dto.LoginRequest;
import com.daijux.Squadify.dto.RegistrationRequest;
import com.daijux.Squadify.model.User;
import com.daijux.Squadify.service.AuthService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
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
                .map(response -> ResponseEntity.status(HttpStatus.CREATED).body(response))
                .onErrorResume(ResponseStatusException.class, e ->
                        Mono.just(ResponseEntity.status(e.getStatusCode())
                                .body(Map.of("error", e.getReason() != null ? e.getReason() : "Registration failed")))
                );
    }

    @PostMapping("/login")
    public Mono<ResponseEntity<Void>> login(@RequestBody LoginRequest request) {
        return authService.login(request)
                .map(authResponse -> {
                    ResponseCookie cookie = ResponseCookie.from("squadify_token", authResponse.getToken())
                            .httpOnly(true)
                            .secure(true)
                            .path("/")
                            .maxAge(7 * 24 * 60 * 60)
                            .sameSite("Strict")
                            .build();
                    return ResponseEntity.ok()
                            .header(HttpHeaders.SET_COOKIE, cookie.toString())
                            .<Void>build();
                })
                .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()));
    }

    @GetMapping("/me")
    public Mono<ResponseEntity<AuthResponse>> me(@CookieValue(name = "squadify_token", required = false) String token) {
        if (token == null) {
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
        }
        return authService.validateAndGetUser(token)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @PostMapping("/logout")
    public Mono<ResponseEntity<Void>> logout() {
        ResponseCookie cookie = ResponseCookie.from("squadify_token", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        return Mono.just(ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build());
    }

    @PostMapping("/change-password")
    public Mono<ResponseEntity<Void>> changePassword(
            @AuthenticationPrincipal User user,
            @RequestBody ChangePasswordRequest request) {
        return authService.changePassword(user.getId(), request)
                .then(Mono.just(ResponseEntity.ok().<Void>build()))
                .onErrorResume(ResponseStatusException.class, e ->
                        Mono.just(ResponseEntity.status(e.getStatusCode()).build())
                )
                .onErrorResume(e ->
                        Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build())
                );
    }

    @DeleteMapping("/delete-account")
    public Mono<ResponseEntity<Void>> deleteAccount(
            @AuthenticationPrincipal User user,
            @RequestBody DeleteAccountRequest request) {

        final ResponseCookie logoutCookie = ResponseCookie.from("squadify_token", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        return authService.deleteAccount(user.getId(), request.getPassword())
                .thenReturn(ResponseEntity.ok()
                        .header(HttpHeaders.SET_COOKIE, logoutCookie.toString())
                        .<Void>build()
                )
                .onErrorResume(ResponseStatusException.class, e ->
                        Mono.just(ResponseEntity.status(e.getStatusCode())
                                .header(HttpHeaders.SET_COOKIE, logoutCookie.toString())
                                .build())
                )
                .onErrorResume(e ->
                        Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build())
                );
    }
}