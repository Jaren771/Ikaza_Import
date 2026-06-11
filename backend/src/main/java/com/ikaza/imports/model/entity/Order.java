/*
 * ============================================================
 * ENTIDAD: Pedido (Order)
 * ============================================================
 *
 * Cuando el usuario confirma la compra, el carrito se convierte
 * en un pedido. Aquí se guarda todo: dirección de envío,
 * totales, estado del pago, etc.
 *
 * PRINCIPIO SOLID: Single Responsibility
 *   La orden solo almacena datos de la compra.
 *   No sabe cómo se procesa el pago ni cómo se envía.
 *
 * RELACIONES:
 *   Order → User       (Muchos a Uno)
 *   Order → Address    (Muchos a Uno)
 *   Order → OrderItem  (Uno a Muchos)
 *   Order → Payment    (Uno a Muchos)
 */

package com.ikaza.imports.model.entity;

import com.ikaza.imports.model.enums.OrderStatus;
import com.ikaza.imports.model.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false, unique = true)
    private String orderNumber;       // Número de orden legible

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id")
    private Address address;          // Dirección de envío

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "shipping_amount", precision = 10, scale = 2)
    private BigDecimal shippingAmount;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;          // Total a pagar

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;        // PENDING, CONFIRMED, SHIPPED, etc.

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus;

    private String notes;
    private String trackingNumber;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<Payment> payments = new ArrayList<>();

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

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
