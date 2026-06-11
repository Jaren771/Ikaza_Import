/*
 * ============================================================
 * SERVICIO: Autenticación
 * ============================================================
 *
 * Aquí está toda la lógica para:
 * - Registrar un nuevo usuario
 * - Iniciar sesión y generar JWT
 *
 * PRINCIPIO SOLID:
 * - Single Responsibility: solo maneja autenticación.
 * - Dependency Inversion: depende de interfaces (repositorios)
 *   y de JwtService, no de implementaciones concretas.
 *
 * PATRÓN: Service Layer
 *   Separa la lógica de negocio de los controladores.
 *   Si la lógica cambia, solo se modifica aquí.
 */

package com.ikaza.imports.service;

import com.ikaza.imports.model.dto.AuthResponse;
import com.ikaza.imports.model.dto.LoginRequest;
import com.ikaza.imports.model.dto.RegisterRequest;
import com.ikaza.imports.model.entity.User;
import com.ikaza.imports.model.enums.UserRole;
import com.ikaza.imports.repository.UserRepository;
import com.ikaza.imports.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // --- REGISTRO ---
    public AuthResponse register(RegisterRequest request) {
        // Verificar que el email no esté repetido
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        // Crear el usuario
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.CUSTOMER)  // Por defecto es cliente
                .active(true)
                .build();

        userRepository.save(user);

        // Generar token JWT
        String token = jwtService.generateToken(user.getEmail(), user.getId(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    // --- LOGIN ---
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email o contraseña incorrectos"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Email o contraseña incorrectos");
        }

        if (!user.getActive()) {
            throw new RuntimeException("Cuenta desactivada");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getId(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
