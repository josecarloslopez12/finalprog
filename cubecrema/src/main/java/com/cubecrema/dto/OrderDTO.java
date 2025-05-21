package com.cubecrema.dto;

import lombok.Data;

import java.util.List;

@Data
public class OrderDTO {
    private List<OrderItemDTO> items;
    private Double total;
}