/*
 * ============================================================
 * ENTIDAD: Marca
 * ============================================================
 *
 * Representa la marca de un producto (HomeStyle, TechPro, etc.)
 * RELACIÓN: Una marca → muchos productos
 */

package com.ikaza.imports.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "brands")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Brand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    private String logo;          // URL del logo

    @Column(name = "is_active")
    private Boolean isActive = true;

    @OneToMany(mappedBy = "brand")
    private List<Product> products = new ArrayList<>();
}
