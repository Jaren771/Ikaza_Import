/*
 * ============================================================
 * SERVICIO: Carrito de Compras
 * ============================================================
 *
 * Lógica para:
 * - Agregar/actualizar/eliminar productos del carrito
 * - Obtener el carrito del usuario
 *
 * Cada usuario tiene UN solo carrito.
 * Si no existe, se crea automáticamente al agregar el primer producto.
 *
 * PRINCIPIO SOLID: Single Responsibility
 *   Este servicio solo maneja operaciones del carrito.
 *   No sabe nada de pedidos, pagos ni productos (solo los usa).
 */

package com.ikaza.imports.service;

import com.ikaza.imports.model.entity.*;
import com.ikaza.imports.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    // Obtener el carrito del usuario (crea uno si no existe)
    public Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(
                        Cart.builder().user(user).build()
                ));
    }

    // Agregar producto al carrito
    @Transactional
    public Cart addItem(User user, Long productId, int quantity) {
        Cart cart = getOrCreateCart(user);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // Verificar si ya está en el carrito
        CartItem existing = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), productId)
                .orElse(null);

        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + quantity);
            cartItemRepository.save(existing);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .price(product.getPrice())
                    .build();
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        return cart;
    }

    // Actualizar cantidad de un item
    @Transactional
    public void updateItemQuantity(Long itemId, int quantity) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item no encontrado"));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }
    }

    // Eliminar item del carrito
    @Transactional
    public void removeItem(Long itemId) {
        cartItemRepository.deleteById(itemId);
    }

    // Vaciar carrito
    @Transactional
    public void clearCart(Long userId) {
        cartRepository.findByUserId(userId).ifPresent(cart ->
                cartItemRepository.deleteByCartId(cart.getId())
        );
    }
}
