/*
 * ============================================================
 * CONTROLADOR: Carrito
 * ============================================================
 *
 * Endpoints para el carrito de compras.
 * Requieren autenticación (token JWT).
 *
 * Endpoints:
 *   GET    /api/cart        → Ver carrito
 *   POST   /api/cart/add    → Agregar producto
 *   PUT    /api/cart/items/{id} → Actualizar cantidad
 *   DELETE /api/cart/items/{id} → Eliminar item
 *   DELETE /api/cart/clear  → Vaciar carrito
 *
 * El usuario se obtiene del token JWT automáticamente.
 * Spring Security lo inyecta en el parámetro @AuthenticationPrincipal.
 */

package com.ikaza.imports.controller;

import com.ikaza.imports.model.dto.AddToCartRequest;
import com.ikaza.imports.model.entity.Cart;
import com.ikaza.imports.model.entity.User;
import com.ikaza.imports.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // Ver carrito
    @GetMapping
    public ResponseEntity<Cart> getCart(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(cartService.getOrCreateCart(user));
    }

    // Agregar producto
    @PostMapping("/add")
    public ResponseEntity<Cart> addItem(@AuthenticationPrincipal User user,
                                         @Valid @RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(
                cartService.addItem(user, request.getProductId(), request.getQuantity())
        );
    }

    // Actualizar cantidad
    @PutMapping("/items/{itemId}")
    public ResponseEntity<Map<String, String>> updateItem(@PathVariable Long itemId,
                                                           @RequestParam int quantity) {
        cartService.updateItemQuantity(itemId, quantity);
        return ResponseEntity.ok(Map.of("message", "Cantidad actualizada"));
    }

    // Eliminar item
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Map<String, String>> removeItem(@PathVariable Long itemId) {
        cartService.removeItem(itemId);
        return ResponseEntity.ok(Map.of("message", "Item eliminado"));
    }

    // Vaciar carrito
    @DeleteMapping("/clear")
    public ResponseEntity<Map<String, String>> clearCart(@AuthenticationPrincipal User user) {
        cartService.clearCart(user.getId());
        return ResponseEntity.ok(Map.of("message", "Carrito vaciado"));
    }
}
