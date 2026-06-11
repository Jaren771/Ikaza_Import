/*
 * ============================================================
 * ENTIDAD: Reseña de Producto
 * ============================================================
 *
 * Los clientes pueden dejar reseñas en los productos que compraron.
 * Las reseñas pueden requerir aprobación del administrador.
 */

package com.ikaza.imports.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer rating;            // 1 a 5 estrellas

    private String title;
    private String content;

    @Column(name = "is_approved")
    private Boolean isApproved = false; // Aprobada por admin

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
