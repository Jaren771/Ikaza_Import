/*
 * Estados de pago de un pedido
 */
package com.ikaza.imports.model.enums;

public enum PaymentStatus {
    PENDING,
    PAID,
    FAILED,
    REFUNDED,
    PARTIALLY_REFUNDED
}
