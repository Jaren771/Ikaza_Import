package com.ikaza.imports.repository;

import com.ikaza.imports.model.entity.Order;
import com.ikaza.imports.model.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Order> findByStatus(OrderStatus status);
    long countByStatus(OrderStatus status);
}
