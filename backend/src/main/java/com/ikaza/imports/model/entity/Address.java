/*
 * ============================================================
 * ENTIDAD: Dirección
 * ============================================================
 *
 * Dirección de envío o facturación del usuario.
 * Un usuario puede tener varias direcciones guardadas.
 */

package com.ikaza.imports.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "addresses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String street;        // Dirección (calle, número, etc.)

    private String city;
    private String state;
    private String zipCode;
    private String country;

    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = false;  // Dirección principal

    private String phone;         // Teléfono de contacto para esta dirección
}
