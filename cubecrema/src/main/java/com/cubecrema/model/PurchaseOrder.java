package com.cubecrema.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "purchase_order")
public class PurchaseOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "transaction_id")
    private String transactionId;
    
    @Column(name = "total_amount")
    private Double totalAmount;
    
    private String status;
    
    @Column(name = "minecraft_username")
    private String minecraftUsername;
    
    private String email;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "payment_date")
    private LocalDateTime paymentDate;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;
}