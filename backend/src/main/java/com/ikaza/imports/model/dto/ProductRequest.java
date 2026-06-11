package com.ikaza.imports.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductRequest {

    @NotBlank
    private String name;

    private String slug;
    private String description;
    private String shortDescription;
    private String sku;

    @Positive
    private BigDecimal price;

    private BigDecimal comparePrice;

    private Long categoryId;
    private Long brandId;

    private Boolean isFeatured;
    private Integer stockQuantity;   // Stock inicial
}
