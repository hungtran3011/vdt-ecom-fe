'use client';

import api from '@/lib/axios';
import { Product, CreateProductRequest, UpdateProductRequest } from '@/types/Product';
import { ApiError, PaginatedResponse } from '@/types/api';

/**
 * Service for handling product-related API requests
 */
export class ProductService {
  /**
   * Fetches all available products with pagination and filtering
   * @param params Pagination and filter parameters
   * @returns Promise with paginated product data
   */
  async getAllProducts(params?: {
    page?: number;
    size?: number;
    cursor?: string | number;
    search?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
  }) {
    try {
      const queryParams = {
        page: 0,
        size: 50,
        ...params
      };
      
      console.log('ProductService: Fetching products with params:', queryParams);
      
      const response = await api.get('/v1/products', {
        params: queryParams
      });
      
      console.log('ProductService: Raw API response:', response.data);
      
      // Handle different response structures
      let result = response.data;
      
      if (response.data.content) {
        // Already in paginated format
        result = response.data;
      } else if (Array.isArray(response.data)) {
        // Convert array to paginated format
        result = {
          content: response.data,
          page: queryParams.page,
          size: queryParams.size,
          totalElements: response.data.length,
          totalPages: Math.ceil(response.data.length / queryParams.size),
          first: queryParams.page === 0,
          last: queryParams.page >= Math.ceil(response.data.length / queryParams.size) - 1,
          hasNext: queryParams.page < Math.ceil(response.data.length / queryParams.size) - 1,
          hasPrevious: queryParams.page > 0
        };
      } else if (response.data.data) {
        // Extract from data field and convert
        const products = response.data.data;
        result = {
          content: Array.isArray(products) ? products : [],
          page: queryParams.page,
          size: queryParams.size,
          totalElements: products.length,
          totalPages: Math.ceil(products.length / queryParams.size),
          first: queryParams.page === 0,
          last: queryParams.page >= Math.ceil(products.length / queryParams.size) - 1,
          hasNext: queryParams.page < Math.ceil(products.length / queryParams.size) - 1,
          hasPrevious: queryParams.page > 0
        };
      }
      
      console.log(`ProductService: Returning paginated result:`, result);
      
      return result;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error as ApiError;
    }
  }

  /**
   * Fetch a single product by ID
   * @param id The product ID
   * @returns Promise with product data
   */
  async getProductById(id: number): Promise<Product> {
    try {
      const response = await api.get(`/v1/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product with id ${id}:`, error);
      throw error as ApiError;
    }
  }

  /**
   * Fetch products by category ID
   * @param categoryId The category ID
   * @param page Optional page number (defaults to 0)
   * @param size Optional page size (defaults to 20)
   * @returns Promise with product data
   */
  async getProductsByCategory(categoryId: string | number, page = 0, size = 20): Promise<Product[]> {
    try {
      const response = await api.get(`/v1/products/category/${categoryId}`, {
        params: { page, size }
      });
      return response.data.content;
    } catch (error) {
      console.error(`Error fetching products for category ${categoryId}:`, error);
      throw error as ApiError;
    }
  }

  /**
   * Get products by category with cursor-based pagination
   * @param categoryId The category ID
   * @param params Pagination parameters
   * @returns Promise with paginated product data
   */
  async getProductsByCategoryPaginated(categoryId: number, params?: {
    page?: number;
    size?: number;
    cursor?: string | number;
  }) {
    try {
      const queryParams = {
        page: 0,
        size: 10,
        ...params
      };
      
      const response = await api.get(`/v1/products/category/${categoryId}/paginated`, {
        params: queryParams
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching paginated products for category ${categoryId}:`, error);
      throw error as ApiError;
    }
  }

  /**
   * Get previous page of products by category using cursor
   * @param categoryId The category ID
   * @param params Pagination parameters (cursor is required)
   * @returns Promise with paginated product data
   */
  async getProductsByCategoryPreviousPage(categoryId: number, params: {
    page?: number;
    size?: number;
    cursor: string | number;
  }) {
    try {
      const queryParams = {
        page: 0,
        size: 10,
        ...params
      };
      
      const response = await api.get(`/v1/products/category/${categoryId}/paginated/previous`, {
        params: queryParams
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching previous page for category ${categoryId}:`, error);
      throw error as ApiError;
    }
  }

  /**
   * Filter products with advanced search criteria using backend's filter endpoint
   * @param filterParams Filter and pagination parameters
   * @returns Promise with filtered and paginated product data
   */
  async filterProducts(filterParams: {
    page?: number;
    size?: number;
    cursor?: string | number;
    name?: string;
    description?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
    startDate?: string;
    endDate?: string;
    dynamicFields?: Array<{
      fieldName: string;
      value: string;
      matchType: 'EQUALS' | 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH';
    }>;
  }) {
    try {
      const requestBody = {
        page: 0,
        size: 10,
        sortBy: 'NAME',
        sortDirection: 'ASC',
        ...filterParams
      };
      
      const response = await api.post('/v1/products/filter/search', requestBody);
      
      return response.data;
    } catch (error) {
      console.error('Error filtering products:', error);
      throw error as ApiError;
    }
  }

  /**
   * Create a new product
   * @param product The product object without ID
   * @returns Promise with the created product
   */
  async createProduct(product: CreateProductRequest): Promise<Product> {
    try {
      const response = await api.post('/v1/products', product);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error as ApiError;
    }
  }

  /**
   * Update an existing product
   * @param id The product ID
   * @param product The product data to update
   * @returns Promise with the updated product
   */
  async updateProduct(id: number, product: UpdateProductRequest): Promise<Product> {
    try {
      const response = await api.put(`/v1/products/${id}`, product);
      return response.data;
    } catch (error) {
      console.error(`Error updating product with id ${id}:`, error);
      throw error as ApiError;
    }
  }

  /**
   * Delete a product
   * @param id The product ID to delete
   * @returns Promise with the operation result
   */
  async deleteProduct(id: number): Promise<void> {
    try {
      await api.delete(`/v1/products/${id}`);
    } catch (error) {
      console.error(`Error deleting product with id ${id}:`, error);
      throw error as ApiError;
    }
  }

  /**
   * Search for products using backend's comprehensive filter endpoint
   * @param params Search and pagination parameters
   * @returns Promise with paginated product data
   */
  async searchProducts(params: {
    query: string;
    page?: number;
    size?: number;
    cursor?: string | number;
  }) {
    try {
      const filterParams = {
        name: params.query, // Use query as name filter
        page: params.page || 0,
        size: params.size || 20,
        sortBy: 'NAME',
        sortDirection: 'ASC'
      };
      
      const response = await api.post('/v1/products/filter/search', filterParams);
      
      return response.data;
    } catch (error) {
      console.error(`Error searching products with query "${params.query}":`, error);
      throw error as ApiError;
    }
  }

  /**
   * Advanced product search using comprehensive filtering
   * @param filterParams Advanced filter criteria
   * @returns Promise with filtered and paginated product data
   */
  async advancedSearchProducts(filterParams: {
    name?: string;
    description?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
    dynamicFields?: Array<{
      fieldName: string;
      value: string;
      matchType: 'EQUALS' | 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH';
    }>;
  }) {
    try {
      const requestBody = {
        page: 0,
        size: 20,
        sortBy: 'NAME',
        sortDirection: 'ASC',
        ...filterParams
      };
      
      const response = await api.post('/v1/products/filter/search', requestBody);
      
      return response.data;
    } catch (error) {
      console.error('Error in advanced product search:', error);
      throw error as ApiError;
    }
  }
}

// Create a singleton instance
export const productService = new ProductService();
