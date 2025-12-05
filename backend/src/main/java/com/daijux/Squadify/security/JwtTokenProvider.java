package com.daijux.Squadify.security;

import com.daijux.Squadify.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    private volatile SecretKey signingKey;

    private SecretKey getSigningKey() {
        if (signingKey != null) return signingKey;

        synchronized (this) {
            if (signingKey != null) return signingKey;

            byte[] keyBytes;
            try {
                keyBytes = Decoders.BASE64.decode(jwtSecret);
            } catch (IllegalArgumentException ex) {
                keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
            }
            signingKey = Keys.hmacShaKeyFor(keyBytes);
            return signingKey;
        }
    }

    private io.jsonwebtoken.JwtParser getJwtParser() {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build();
    }

    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
                .claim("id", user.getId())
                .claim("username", user.getUsername())
                .claim("roles", user.getRoles())
                .subject(user.getUsername())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    private Claims getAllClaimsFromToken(String token) {
        return getJwtParser()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String authToken) {
        try {
            getAllClaimsFromToken(authToken);
            return true;
        } catch (ExpiredJwtException ex) {
            logger.debug("Token JWT expiré");
        } catch (SecurityException ex) {
            logger.debug("Signature JWT invalide");
        } catch (JwtException ex) {
            logger.debug("Erreur de validation JWT");
        } catch (Exception ex) {
            logger.error("Erreur inattendue lors de la validation JWT", ex);
        }
        return false;
    }

    public String getUserIdFromToken(String token) {
        return getAllClaimsFromToken(token).get("id", String.class);
    }

    public String getUsernameFromToken(String token) {
        return getAllClaimsFromToken(token).getSubject();
    }

    public List<String> getRolesFromToken(String token) {
        Object rolesObject = getAllClaimsFromToken(token).get("roles");
        if (!(rolesObject instanceof List<?> rolesList)) {
            return List.of();
        }
        return rolesList.stream()
                .map(Object::toString)
                .collect(Collectors.toList());
    }
}
