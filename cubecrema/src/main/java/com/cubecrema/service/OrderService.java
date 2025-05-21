package com.cubecrema.service;

import com.cubecrema.dto.OrderDTO;
import com.cubecrema.model.PurchaseOrder;

public interface OrderService {
    PurchaseOrder processOrder(OrderDTO orderDTO) throws Exception;
}