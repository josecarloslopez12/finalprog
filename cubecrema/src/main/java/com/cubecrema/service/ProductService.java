package com.cubecrema.service;

import com.cubecrema.model.Category;
import com.cubecrema.model.Product;

import java.util.List;
import java.util.Optional;

public interface ProductService {
    List<Product> findAllProducts();
    Optional<Product> findProductById(Long id);
    List<Product> findProductsByCategoryName(String categoryName);
    List<Category> findAllCategories();
}