package com.ikaza.imports.model.dto;

import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class AddToCartRequest {
    private Long productId;
    @Positive
    private Integer quantity = 1;
}
