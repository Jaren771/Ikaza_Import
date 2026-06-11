/*
 * ============================================================
 * CONFIGURACIÓN DE SEGURIDAD
 * ============================================================
 *
 * Configura Spring Security para:
 * - Usar JWT en lugar de sesiones
 * - Permitir acceso público a: login, registro, catálogo
 * - Requerir autenticación para: carrito, checkout
 * - Requerir rol ADMIN para: admin panel
 *
 * PRINCIPIO SOLID: Open/Closed
 *   Si queremos agregar una nueva ruta pública, solo la
 *   agregamos al array "permitAll" sin modificar la lógica.
 *
 * PATRÓN: Decorator / Security Filter Chain
 *   Spring Security envuelve las peticiones con una cadena
 *   de filtros de seguridad.
 */

package com.ikaza.imports.config;

import com.ikaza.imports.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())   // APIs no necesitan CSRF
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Sin sesiones
            .authorizeHttpRequests(auth -> auth
                // Rutas públicas (sin token)
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/products/**").permitAll()
                .requestMatchers("/api/categories/**").permitAll()
                // Rutas de administrador
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Rutas de usuario autenticado
                .requestMatchers("/api/cart/**").authenticated()
                .requestMatchers("/api/orders/**").authenticated()
                // Cualquier otra ruta requiere autenticación
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
