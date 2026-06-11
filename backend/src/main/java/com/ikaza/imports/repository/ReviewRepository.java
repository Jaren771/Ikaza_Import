package com.ikaza.imports.repository;

import com.ikaza.imports.model.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdAndIsApprovedTrue(Long productId);
    List<Review> findByIsApprovedFalse();
}
