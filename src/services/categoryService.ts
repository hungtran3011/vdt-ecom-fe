'use client';

import api from '@/lib/axios';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/Category';
import { ApiError } from '@/types/api';

/**
 * Service for handling category-related API requests
 */
export class CategoryService {
  /**
   * Fetches all available categories
   * @param page Optional page number (defaults to 0)
   * @param size Optional page size (defaults to 50)
   * @returns Promise with category data
   */
  async getAllCategories(page = 0, size = 50): Promise<Category[]> {
    try {
      console.log('CategoryService: Fetching categories with params:', { page, size });
      
      const response = await api.get('/v1/categories', {
        params: { page, size }
      });
      
      console.log('CategoryService: Raw API response:', response.data);
      
      // Handle different response structures
      let categories: Category[] = [];
      
      if (response.data.content) {
        // Paginated response structure
        categories = response.data.content;
        console.log('CategoryService: Extracted categories from paginated response:', categories);
      } else if (Array.isArray(response.data)) {
        // Direct array response
        categories = response.data;
        console.log('CategoryService: Using direct array response:', categories);
      } else if (response.data.data) {
        // Wrapped in data field
        categories = response.data.data;
        console.log('CategoryService: Extracted categories from data field:', categories);
      } else {
        console.warn('CategoryService: Unexpected response structure:', response.data);
        categories = [];
      }
      
      // Log final result
      console.log(`CategoryService: Returning ${categories.length} categories`);
      
      return Array.isArray(categories) ? categories : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error as ApiError;
    }
  }

  /**
   * Fetch a single category by ID
   * @param id The category ID
   * @returns Promise with category data
   */
  async getCategoryById(id: number): Promise<Category> {
    try {
      const response = await api.get(`/v1/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category with id ${id}:`, error);
      throw error as ApiError;
    }
  }

  /**
   * Create a new category
   * @param category The category object without ID
   * @returns Promise with the created category
   */
  async createCategory(category: CreateCategoryRequest): Promise<Category> {
    try {
      const response = await api.post('/v1/categories', category);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error as ApiError;
    }
  }

  /**
   * Update an existing category
   * @param id The category ID
   * @param category The category data to update
   * @returns Promise with the updated category
   */
  async updateCategory(id: number, category: UpdateCategoryRequest): Promise<Category> {
    try {
      const response = await api.put(`/v1/categories/${id}`, category);
      return response.data;
    } catch (error) {
      console.error(`Error updating category with id ${id}:`, error);
      throw error as ApiError;
    }
  }

  /**
   * Delete a category
   * @param id The category ID to delete
   * @returns Promise with the operation result
   */
  async deleteCategory(id: number): Promise<void> {
    try {
      await api.delete(`/v1/categories/${id}`);
    } catch (error) {
      console.error(`Error deleting category with id ${id}:`, error);
      throw error as ApiError;
    }
  }
}

// Create a singleton instance
export const categoryService = new CategoryService();
