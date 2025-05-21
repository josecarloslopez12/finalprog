package com.cubecrema.service;

import com.cubecrema.dto.OrderDTO;
import com.cubecrema.dto.OrderItemDTO;
import com.cubecrema.model.*;
import com.cubecrema.repository.OrderItemRepository;
import com.cubecrema.repository.ProductRepository;
import com.cubecrema.repository.PurchaseOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private PurchaseOrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;

    @Override
    @Transactional
    public PurchaseOrder processOrder(OrderDTO orderDTO) throws Exception {
        // Crear la orden
        PurchaseOrder order = new PurchaseOrder();
        order.setTransactionId("TRX-" + UUID.randomUUID().toString().substring(0, 9).toUpperCase());
        order.setTotalAmount(orderDTO.getTotal());
        order.setStatus("COMPLETED");
        order.setCreatedAt(LocalDateTime.now());
        order.setPaymentDate(LocalDateTime.now());
        
        // Guardar la orden
        PurchaseOrder savedOrder = orderRepository.save(order);
        
        // Crear los items de la orden
        List<OrderItem> orderItems = orderDTO.getItems().stream().map(itemDTO -> {
            OrderItem item = new OrderItem();
            Product product = productRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
            
            item.setOrder(savedOrder);
            item.setProduct(product);
            item.setQuantity(itemDTO.getQuantity());
            item.setPrice(itemDTO.getPrice());
            
            return item;
        }).collect(Collectors.toList());
        
        // Guardar los items
        orderItemRepository.saveAll(orderItems);
        savedOrder.setItems(orderItems);
        
        return savedOrder;
    }
}