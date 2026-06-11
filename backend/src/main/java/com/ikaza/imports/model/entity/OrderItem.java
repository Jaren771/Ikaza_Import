/*
 * ============================================================
 * ENTIDAD: Item del Pedido
 * ============================================================
 *
 * Guarda qué producto se compró, a qué precio y en qué cantidad.
 * Es un "momento" de lo que había en el carrito cuando se
 * confirmó la compra.
 *
 * RELACIÓN: Muchos items → un pedido
 */

package com.ikaza.imports.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;      // unitPrice * quantity

    @Column(nullable = false)
    private String productName;         // Copia del nombre (por si cambia después)

    private String productSku;          // Copia del SKU
}
