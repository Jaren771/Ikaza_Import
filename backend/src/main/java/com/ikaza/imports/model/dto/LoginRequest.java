/*
 * ============================================================
 * DTO: Solicitud de Login
 * ============================================================
 *
 * DTO = Data Transfer Object.
 * Sirve para recibir datos del frontend sin exponer la entidad.
 * Aquí solo pedimos email y contraseña para iniciar sesión.
 *
 * PRINCIPIO SOLID: Single Responsibility
 *   Este DTO solo sirve para transportar datos de login.
 *   No tiene lógica de negocio ni acceso a BD.
 */

package com.ikaza.imports.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Formato de email inválido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;
}
