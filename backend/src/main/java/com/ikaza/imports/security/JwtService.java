/*
 * ============================================================
 * SERVICIO: JWT (Json Web Token)
 * ============================================================
 *
 * Se encarga de generar y validar los tokens JWT.
 * Un token JWT es como un "carnet digital" que el usuario
 * recibe al iniciar sesión y lo usa para identificarse en
 * cada petición sin necesidad de enviar su contraseña.
 *
 * PRINCIPIO SOLID: Single Responsibility
 *   Este servicio solo hace una cosa: manejar JWT.
 *
 * PATRÓN: Strategy
 *   Podríamos cambiar la librería JWT sin afectar
 *   los servicios que lo usan (AuthService).
 */

package com.ikaza.imports.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    private final String secretKey;
    private final long expirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secretKey,
            @Value("${jwt.expiration}") long expirationMs) {
        this.secretKey = secretKey;
        this.expirationMs = expirationMs;
    }

    // Genera un token para un usuario
    public String generateToken(String email, Long userId, String role) {
        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    // Extrae el email del token
    public String extractEmail(String token) {
        return parseToken(token).getPayload().getSubject();
    }

    // Extrae el ID del usuario del token
    public Long extractUserId(String token) {
        return parseToken(token).getPayload().get("userId", Long.class);
    }

    // Verifica si el token es válido
    public boolean isTokenValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Jws<Claims> parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
