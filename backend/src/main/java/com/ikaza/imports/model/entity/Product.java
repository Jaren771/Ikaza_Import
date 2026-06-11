/*
 * ============================================================
 * ENTIDAD: Producto
 * ============================================================
 *
 * El corazón del sistema. Un producto tiene:
 * - Datos básicos: nombre, precio, descripción
 * - Relaciones: categoría, marca, inventario
 * - Imágenes, reseñas, variantes
 *
 * PRINCIPIO SOLID: Single Responsibility
 *   El producto solo se preocupa de sus propios datos.
 *   No sabe cómo lo guardan, lo buscan o lo muestran.
 *
 * RELACIONES:
 *   Producto → Categoría  (Muchos a Uno)
 *   Producto → Marca      (Muchos a Uno)
 *   Producto → Inventario  (Uno a Uno)
 *   Producto → Imágenes    (Uno a Muchos)
 *   Producto → Reseñas     (Uno a Muchos)
 */

package com.ikaza.imports.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;                // Para URLs amigables

    @Column(columnDefinition = "TEXT")
    private String description;

    private String shortDescription;
    private String sku;                 // Código único del producto
    private String barcode;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;           // Precio actual

    @Column(name = "compare_price", precision = 10, scale = 2)
    private BigDecimal comparePrice;    // Precio de referencia (para mostrar descuento)

    @Column(name = "cost_price", precision = 10, scale = 2)
    private BigDecimal costPrice;       // Precio de compra

    @Column(nullable = false)
    private String status = "ACTIVE";   // ACTIVE, DRAFT, INACTIVE, DISCONTINUED

    @Column(name = "is_featured")
    private Boolean isFeatured = false; // Destacado en la página principal

    @ElementCollection
    @CollectionTable(name = "product_tags", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    // === Relaciones ===

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_id")
    private Inventory inventory;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<ProductImage> images = new ArrayList<>();

    // Fechas
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

    // Método helper para calcular el descuento
    public BigDecimal getDiscountPercentage() {
        if (comparePrice != null && comparePrice.compareTo(BigDecimal.ZERO) > 0) {
            return BigDecimal.ONE.subtract(
                price.divide(comparePrice, 2, java.math.RoundingMode.HALF_UP)
            ).multiply(BigDecimal.valueOf(100));
        }
        return BigDecimal.ZERO;
    }
}
