/*
 * ============================================================
 * ENTIDAD: Pago
 * ============================================================
 *
 * Registra cada intento de pago de un pedido.
 * Un pedido puede tener varios pagos (ej: reintentos).
 *
 * RELACIÓN: Muchos pagos → un pedido
 */

package com.ikaza.imports.model.entity;

import com.ikaza.imports.model.enums.PaymentProvider;
import com.ikaza.imports.model.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentProvider provider;   // MERCADOPAGO, CULQI, etc.

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;       // PENDING, PAID, FAILED, etc.

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String currency = "PEN";

    @Column(name = "provider_payment_id")
    private String providerPaymentId;   // ID del pago en el proveedor externo

    @Column(columnDefinition = "JSON")
    private String metadata;            // Info adicional del proveedor

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
