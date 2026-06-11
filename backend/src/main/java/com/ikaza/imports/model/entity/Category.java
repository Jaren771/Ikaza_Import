/*
 * ============================================================
 * ENTIDAD: Categoría
 * ============================================================
 *
 * Agrupa productos por tipo: Hogar, Cocina, Tecnología, etc.
 * Una categoría puede tener varias subcategorías.
 *
 * RELACIÓN: Una categoría → muchos productos
 */

package com.ikaza.imports.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categories")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;          // Identificador para la URL (ej: "hogar")

    private String description;
    private Integer sortOrder;    // Orden en que se muestran

    @Column(name = "is_active")
    private Boolean isActive = true;

    // Una categoría tiene muchos productos
    @OneToMany(mappedBy = "category")
    private List<Product> products = new ArrayList<>();
}
