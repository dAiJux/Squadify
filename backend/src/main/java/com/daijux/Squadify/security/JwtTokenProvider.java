package com.daijux.Squadify.security;

import com.daijux.Squadify.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import javax.crypto.SecretKey;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private JwtParser getJwtParser() {
        return Jwts.parser()
                .verifyWith((SecretKey) getSigningKey())
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
        } catch (SecurityException ex) {
            logger.error("Signature JWT invalide (SecurityException) : {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            logger.error("Token JWT expiré : {}", ex.getMessage());
        } catch (Exception ex) {
            logger.error("Erreur de validation JWT : {}", ex.getMessage());
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
        List<?> rolesObject = getAllClaimsFromToken(token).get("roles", List.class);
        if (rolesObject == null) {
            return List.of();
        }
        return rolesObject.stream()
                .map(Object::toString)
                .collect(Collectors.toList());
    }
}