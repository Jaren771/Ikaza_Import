/*
 * ============================================================
 * CONTROLADOR: Productos
 * ============================================================
 *
 * Endpoints públicos para el catálogo.
 * No requieren token (cualquiera puede ver productos).
 *
 * Endpoints:
 *   GET /api/products           → Lista paginada
 *   GET /api/products/search?q=  → Búsqueda por texto
 *   GET /api/products/featured   → Destacados
 *   GET /api/products/{slug}     → Detalle de producto
 *   POST /api/admin/products     → Crear (solo ADMIN)
 *   DELETE /api/admin/products/{id} → Eliminar (solo ADMIN)
 *
 * PATRÓN: Controller (MVC)
 *   Capa más externa. Solo recibe y responde.
 *   Delega la lógica a ProductService.
 */

package com.ikaza.imports.controller;

import com.ikaza.imports.model.dto.ProductRequest;
import com.ikaza.imports.model.entity.Product;
import com.ikaza.imports.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // Listar productos activos (público)
    @GetMapping("/products")
    public ResponseEntity<Page<Product>> listProducts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(
                productService.listActiveProducts(page, size, sortBy, category)
        );
    }

    // Búsqueda por texto
    @GetMapping("/products/search")
    public ResponseEntity<Page<Product>> searchProducts(
            @RequestParam String q,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(productService.searchProducts(q, page, size));
    }

    // Productos destacados
    @GetMapping("/products/featured")
    public ResponseEntity<List<Product>> getFeatured() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    // Detalle de producto por slug
    @GetMapping("/products/{slug}")
    public ResponseEntity<Product> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getBySlug(slug));
    }

    // Crear producto (solo admin)
    @PostMapping("/admin/products")
    public ResponseEntity<Product> createProduct(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    // Eliminar producto (solo admin)
    @DeleteMapping("/admin/products/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(Map.of("message", "Producto eliminado"));
    }
}
