/*
 * ============================================================
 * FILTRO DE SEGURIDAD: JWT
 * ============================================================
 *
 * Este filtro se ejecuta en cada petición HTTP.
 * Revisa si el request tiene un token JWT válido en el
 * header "Authorization" y, si es así, identifica al usuario.
 *
 * Si el token es inválido o no existe, la petición sigue
 * pero el usuario no estará autenticado (acceso solo a
 * rutas públicas como /api/products).
 *
 * PRINCIPIO SOLID: Single Responsibility
 *   Solo hace una cosa: validar JWT y autenticar usuarios.
 *
 * PATRÓN: Chain of Responsibility (cadena de filtros)
 *   Spring Security ejecuta este filtro en una cadena.
 *   Pueden haber muchos filtros, cada uno hace su parte.
 */

package com.ikaza.imports.security;

import com.ikaza.imports.model.entity.User;
import com.ikaza.imports.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            if (jwtService.isTokenValid(token)) {
                String email = jwtService.extractEmail(token);
                User user = userRepository.findByEmail(email).orElse(null);

                if (user != null) {
                    // Crear la autenticación de Spring Security
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    user, null,
                                    List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                            );
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
