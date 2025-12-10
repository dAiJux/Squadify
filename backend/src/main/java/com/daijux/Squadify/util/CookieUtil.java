package com.daijux.Squadify.util;

import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class CookieUtil {

    private static final String COOKIE_NAME = "squadify_token";
    private static final int MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
    private static final String PATH = "/";

    public ResponseCookie createAuthCookie(String token) {
        return ResponseCookie.from(COOKIE_NAME, token)
                .httpOnly(true)
                .secure(true)
                .path(PATH)
                .maxAge(MAX_AGE_SECONDS)
                .sameSite("Strict")
                .build();
    }

    public ResponseCookie createLogoutCookie() {
        return ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .secure(true)
                .path(PATH)
                .maxAge(0)
                .sameSite("Strict")
                .build();
    }

    public String getCookieName() {
        return COOKIE_NAME;
    }
}