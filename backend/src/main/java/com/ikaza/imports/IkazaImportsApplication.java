/*
 * ============================================================
 * ikaZa Import — Backend (Spring Boot)
 * ============================================================
 *
 * Punto de entrada de la aplicación.
 * Spring Boot arranca todo: la base de datos, los controladores,
 * los servicios y la seguridad automáticamente.
 *
 * PRINCIPIO SOLID usado aquí:
 * - Single Responsibility: esta clase solo se encarga de
 *   iniciar la aplicación, nada más.
 *
 * PATRÓN usado: Spring Boot Application (arranque automático)
 */

package com.ikaza.imports;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class IkazaImportsApplication {

    public static void main(String[] args) {
        SpringApplication.run(IkazaImportsApplication.class, args);
    }
}
