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
        order.setStatus("COMPLETED"); // Assuming "COMPLETED" as per original logic, can be "PENDING" from schema.sql
        order.setMinecraftUsername(orderDTO.getMinecraftUsername());
        order.setEmail(orderDTO.getEmail());
        order.setCreatedAt(LocalDateTime.now());
        order.setPaymentDate(LocalDateTime.now()); // Assuming payment is immediate

        // Guardar la orden primero para obtener su ID
        PurchaseOrder savedOrder = orderRepository.save(order);

        // Crear los items de la orden
        List<OrderItem> orderItems = orderDTO.getItems().stream().map(itemDTO -> {
            OrderItem item = new OrderItem();
            // Use itemDTO.getId() to find the product
            Product product = productRepository.findById(itemDTO.getId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + itemDTO.getId()));

            item.setOrder(savedOrder); // Link item to the saved order
            item.setProduct(product);
            item.setQuantity(itemDTO.getQuantity());
            item.setPrice(itemDTO.getPrice()); // This is the price per unit at the time of purchase

            return item;
        }).collect(Collectors.toList());

        // Guardar los items de la orden
        orderItemRepository.saveAll(orderItems);
        
        // Asignar los items guardados a la orden (opcional si la relación es bien manejada por JPA y no se necesita inmediatamente)
        // savedOrder.setItems(orderItems); // This might cause another save if items are not managed by cascade from order

        return savedOrder; // Devuelve la orden con sus items (si la relación está configurada para cargarlos)
    }
}