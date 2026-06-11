/*
 * ============================================================
 * ENTIDAD: Imagen de Producto
 * ============================================================
 *
 * Un producto puede tener varias fotos.
 * Una de ellas es la principal (isPrimary = true).
 *
 * RELACIÓN: Muchas imágenes → un producto
 */

package com.ikaza.imports.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_images")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String url;

    private String alt;             // Texto alternativo para accesibilidad

    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    private Integer position = 0;   // Orden en que se muestran

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
}
