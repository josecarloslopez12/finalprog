package com.cubecrema.service;

import com.cubecrema.dto.ProductDTO;
import com.cubecrema.model.Category;

import java.util.List;
import java.util.Optional;

public interface ProductService {
    List<ProductDTO> findAllProducts();
    Optional<ProductDTO> findProductById(Long id);
    List<ProductDTO> findProductsByCategoryName(String categoryName);
    List<Category> findAllCategories();
}