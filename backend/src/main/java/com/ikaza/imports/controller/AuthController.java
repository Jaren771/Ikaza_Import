/*
 * ============================================================
 * CONTROLADOR: Autenticación
 * ============================================================
 *
 * Endpoints públicos para login y registro.
 * No requieren token JWT.
 *
 * Endpoints:
 *   POST /api/auth/register  → Crear cuenta nueva
 *   POST /api/auth/login     → Iniciar sesión
 *
 * PATRÓN: Controller (MVC)
 *   Recibe la petición HTTP, llama al servicio y devuelve
 *   la respuesta. No tiene lógica de negocio.
 *
 * PRINCIPIO SOLID: Single Responsibility
 *   Solo maneja peticiones de autenticación.
 *   La lógica está en AuthService.
 */

package com.ikaza.imports.controller;

import com.ikaza.imports.model.dto.AuthResponse;
import com.ikaza.imports.model.dto.LoginRequest;
import com.ikaza.imports.model.dto.RegisterRequest;
import com.ikaza.imports.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
