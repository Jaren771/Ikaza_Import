package com.ikaza.imports.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductRequest {

    @NotBlank
    @Pattern(regexp = "^[^<>&]*$", message = "Caracteres no permitidos (<, >, &)")
    private String name;

    @Pattern(regexp = "^[^<>&]*$", message = "Caracteres no permitidos (<, >, &)")
    private String slug;
    @Pattern(regexp = "^[^<>&]*$", message = "Caracteres no permitidos (<, >, &)")
    private String description;
    @Pattern(regexp = "^[^<>&]*$", message = "Caracteres no permitidos (<, >, &)")
    private String shortDescription;
    @Pattern(regexp = "^[^<>&]*$", message = "Caracteres no permitidos (<, >, &)")
    private String sku;

    @Positive
    private BigDecimal price;

    private BigDecimal comparePrice;

    private Long categoryId;
    private Long brandId;

    private Boolean isFeatured;
    private Integer stockQuantity;   // Stock inicial
}
