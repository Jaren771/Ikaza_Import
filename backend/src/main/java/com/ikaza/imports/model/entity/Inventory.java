/*
 * ============================================================
 * ENTIDAD: Inventario
 * ============================================================
 *
 * Controla el stock de cada producto:
 * - quantity: cuántos hay disponibles
 * - reservedQuantity: cuántos están reservados en carritos
 * - minStock: mínimo antes de mostrar alerta
 *
 * RELACIÓN: Un producto → un inventario
 */

package com.ikaza.imports.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inventory")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    @Column(name = "reserved_quantity")
    @Builder.Default
    private Integer reservedQuantity = 0;

    @Column(name = "min_stock")
    @Builder.Default
    private Integer minStock = 5;

    // El producto al que pertenece este inventario
    @OneToOne(mappedBy = "inventory")
    private Product product;
}
