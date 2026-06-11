/*
 * ============================================================
 * Roles de Usuario
 * ============================================================
 *
 * Cada rol define lo que un usuario puede hacer:
 * - SUPER_ADMIN: acceso total al sistema
 * - ADMIN:     administra productos, pedidos, clientes
 * - MANAGER:   gestiona importaciones e inventario
 * - CUSTOMER:  cliente normal que compra en la tienda
 *
 * PRINCIPIO SOLID: Open/Closed
 * Si en el futuro se necesita un nuevo rol, solo hay que
 * agregarlo aquí sin modificar el código que ya funciona.
 */

package com.ikaza.imports.model.enums;

public enum UserRole {
    SUPER_ADMIN,
    ADMIN,
    MANAGER,
    CUSTOMER
}
