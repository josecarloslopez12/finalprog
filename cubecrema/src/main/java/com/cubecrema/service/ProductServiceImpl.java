package com.cubecrema.service;

import com.cubecrema.dto.ProductDTO;
import com.cubecrema.model.Category;
import com.cubecrema.model.Product;
import com.cubecrema.repository.CategoryRepository;
import com.cubecrema.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private ProductDTO convertToDTO(Product product) {
        ProductDTO productDTO = new ProductDTO();
        productDTO.setId(product.getId());
        productDTO.setName(product.getName());
        productDTO.setDescription(product.getDescription());
        productDTO.setPrice(product.getPrice());
        if (product.getCategory() != null) {
            productDTO.setCategory(product.getCategory().getName());
        }
        // Assuming ProductDTO has an imagePath field to be added later if needed
        // productDTO.setImagePath(product.getImagePath()); 
        return productDTO;
    }

    @Override
    public List<ProductDTO> findAllProducts() {
        return productRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<ProductDTO> findProductById(Long id) {
        return productRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Override
    public List<ProductDTO> findProductsByCategoryName(String categoryName) {
        return productRepository.findByCategory_Name(categoryName).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<Category> findAllCategories() {
        return categoryRepository.findAll();
    }
}