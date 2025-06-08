'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/Category';
import { categoryService } from '@/services/categoryService';

/**
 * Custom hook for fetching all categories with React Query
 */
export const useCategories = () => {
  return useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
};

/**
 * Custom hook for fetching a single category by ID
 */
export const useCategory = (categoryId: number) => {
  return useQuery<Category, Error>({
    queryKey: ['categories', categoryId],
    queryFn: () => categoryService.getCategoryById(categoryId),
    enabled: !!categoryId,
  });
};

/**
 * Custom hook for creating a category
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newCategory: CreateCategoryRequest) => 
      categoryService.createCategory(newCategory),
    onSuccess: () => {
      // Invalidate the categories query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

/**
 * Custom hook for updating a category
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryRequest }) => 
      categoryService.updateCategory(id, data),
    onSuccess: (updatedCategory) => {
      // Update specific category in cache
      queryClient.setQueryData(['categories', updatedCategory.id], updatedCategory);
      // Invalidate the categories list
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

/**
 * Custom hook for deleting a category
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (categoryId: number) => categoryService.deleteCategory(categoryId),
    onSuccess: (_, categoryId) => {
      // Remove from specific category cache
      queryClient.removeQueries({ queryKey: ['categories', categoryId] });
      // Invalidate the categories list
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
