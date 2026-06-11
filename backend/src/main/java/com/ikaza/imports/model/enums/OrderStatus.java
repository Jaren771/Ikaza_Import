/*
 * Estados por los que pasa un pedido
 */
package com.ikaza.imports.model.enums;

public enum OrderStatus {
    PENDING,      // Pendiente
    CONFIRMED,    // Confirmado
    PROCESSING,   // En preparación
    SHIPPED,      // Enviado
    DELIVERED,    // Entregado
    CANCELLED,    // Cancelado
    REFUNDED      // Reembolsado
}
