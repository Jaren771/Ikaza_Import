/*
 * REPOSITORIO: Producto
 * Consultas personalizadas para el catálogo.
 *
 * findByCategoryId: filtra productos por categoría
 * findBySlug: busca por URL amigable
 * findByIsFeaturedTrue: productos destacados
 * findByStatusAndPriceBetween: rango de precio + estado
 */

package com.ikaza.imports.repository;

import com.ikaza.imports.model.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySlug(String slug);

    List<Product> findByIsFeaturedTrue();

    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    // Búsqueda por texto en nombre, descripción o SKU
    @Query("SELECT p FROM Product p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<Product> search(@Param("q") String query, Pageable pageable);

    // Productos activos en un rango de precio
    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' " +
           "AND p.price BETWEEN :min AND :max")
    List<Product> findByPriceRange(@Param("min") BigDecimal min,
                                    @Param("max") BigDecimal max);
}
