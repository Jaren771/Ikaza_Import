/*
 * ============================================================
 * REPOSITORIO: Usuario
 * ============================================================
 *
 * Aquí se hacen las consultas a la tabla "users".
 * Spring Data JPA implementa automáticamente los métodos
 * básicos: guardar, buscar por ID, listar, eliminar.
 *
 * Los métodos como "findByEmail" se generan solos según
 * el nombre del método (Spring Data JPA magic).
 *
 * PATRÓN: Repository (DAO)
 * Separa la lógica de acceso a datos del resto del sistema.
 * Si cambiamos de MySQL a PostgreSQL, solo cambia el
 * application.yml, no este código.
 *
 * PRINCIPIO SOLID: Dependency Inversion
 *   El servicio depende de esta interfaz, no de la
 *   implementación concreta de la base de datos.
 */

package com.ikaza.imports.repository;

import com.ikaza.imports.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
