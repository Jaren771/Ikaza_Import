/*
 * ============================================================
 * ENTIDAD: Cupón de Descuento
 * ============================================================
 *
 * Sirve para aplicar descuentos en los pedidos.
 * Puede ser:
 * - PERCENTAGE: descuento por porcentaje (ej: 10%)
 * - FIXED: descuento en monto fijo (ej: S/20)
 * - FREE_SHIPPING: envío gratis
 *
 * PRINCIPIO SOLID: Open/Closed
 *   Si queremos un nuevo tipo de descuento, solo agregamos
 *   un valor al enum DiscountType sin tocar esta clase.
 */

package com.ikaza.imports.model.entity;

import com.ikaza.imports.model.enums.DiscountType;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;               // Código que ingresa el usuario (ej: "BIENVENIDO10")

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType; // PERCENTAGE, FIXED o FREE_SHIPPING

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;  // Valor del descuento

    @Column(name = "min_purchase", precision = 10, scale = 2)
    private BigDecimal minPurchase;    // Monto mínimo para usar el cupón

    @Column(name = "max_uses")
    private Integer maxUses;           // Máximo de usos totales

    @Column(name = "used_count")
    private Integer usedCount = 0;     // Veces que se ha usado

    @Column(name = "starts_at")
    private LocalDateTime startsAt;    // Fecha de inicio de vigencia

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;   // Fecha de expiración

    @Column(name = "is_active")
    private Boolean isActive = true;
}
