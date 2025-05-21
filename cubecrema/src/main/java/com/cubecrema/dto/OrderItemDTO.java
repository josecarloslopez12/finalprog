package com.cubecrema.dto;

import lombok.Data;

@Data
public class OrderItemDTO {
    private Long id; // Changed from productId
    private String name; // Changed from productName
    private Integer quantity;
    private Double price;
    // The 'type' field from script.js is not included here as it's likely
    // not needed for backend processing if 'id' uniquely identifies the product.
}