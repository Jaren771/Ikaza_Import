/*
 * ============================================================
 * ENTIDAD: Usuario
 * ============================================================
 *
 * Representa a una persona que usa la plataforma.
 * Puede ser cliente, administrador, importador, etc.
 *
 * Cada usuario tiene un rol que define sus permisos.
 *
 * PRINCIPIO SOLID:
 * - Single Responsibility: esta clase solo modela al usuario.
 *   No tiene lógica de negocio ni de base de datos.
 *
 * PATRÓN: JPA Entity — cada instancia es una fila en la tabla "users".
 */

package com.ikaza.imports.model.entity;

import com.ikaza.imports.model.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;       // Contraseña encriptada con BCrypt

    private String image;          // URL de la foto de perfil
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;         // SUPER_ADMIN, ADMIN, MANAGER o CUSTOMER

    private Boolean active = true; // Si la cuenta está activa

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Se ejecuta antes de guardar por primera vez
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
