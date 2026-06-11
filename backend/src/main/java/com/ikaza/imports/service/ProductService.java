/*
 * ============================================================
 * SERVICIO: Producto
 * ============================================================
 *
 * Lógica de negocio para el catálogo:
 * - Listar productos (con paginación y filtros)
 * - Buscar por slug
 * - Crear, actualizar, eliminar
 *
 * PRINCIPIO SOLID: Open/Closed
 *   Podemos agregar nuevos filtros sin modificar este servicio.
 *   Solo agregamos un parámetro más al método y su query.
 *
 * PATRÓN: Service Layer + Builder
 *   ProductService organiza la lógica de catálogo.
 *   El Builder de Lombok crea objetos Product fácilmente.
 */

package com.ikaza.imports.service;

import com.ikaza.imports.model.dto.ProductRequest;
import com.ikaza.imports.model.entity.*;
import com.ikaza.imports.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    // Listar todos los productos activos con paginación
    public Page<Product> listActiveProducts(int page, int size, String sortBy, String categorySlug) {
        Sort sort = switch (sortBy != null ? sortBy : "newest") {
            case "price_asc" -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "name" -> Sort.by("name").ascending();
            default -> Sort.by("createdAt").descending(); // "newest"
        };

        Pageable pageable = PageRequest.of(page - 1, size, sort);

        if (categorySlug != null && !categorySlug.isEmpty()) {
            Category category = categoryRepository.findBySlug(categorySlug).orElse(null);
            if (category != null) {
                return productRepository.findByCategoryId(category.getId(), pageable);
            }
        }

        return productRepository.findAll(pageable);
    }

    // Buscar productos por texto
    public Page<Product> searchProducts(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        return productRepository.search(query, pageable);
    }

    // Obtener un producto por su slug
    public Product getBySlug(String slug) {
        return productRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + slug));
    }

    // Obtener productos destacados
    public java.util.List<Product> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrue();
    }

    // Crear un nuevo producto
    @Transactional
    public Product createProduct(ProductRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setSlug(request.getSlug() != null ? request.getSlug()
                : request.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-"));
        product.setDescription(request.getDescription());
        product.setShortDescription(request.getShortDescription());
        product.setSku(request.getSku());
        product.setPrice(request.getPrice());
        product.setComparePrice(request.getComparePrice());
        product.setIsFeatured(request.getIsFeatured());

        if (request.getCategoryId() != null) {
            product.setCategory(categoryRepository.findById(request.getCategoryId()).orElse(null));
        }
        if (request.getBrandId() != null) {
            product.setBrand(brandRepository.findById(request.getBrandId()).orElse(null));
        }

        // Crear inventario inicial
        Inventory inventory = Inventory.builder()
                .quantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0)
                .minStock(5)
                .build();
        product.setInventory(inventory);

        return productRepository.save(product);
    }

    // Eliminar producto (soft delete)
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        product.setStatus("DISCONTINUED");
        productRepository.save(product);
    }
}
