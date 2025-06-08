'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Product, CreateProductRequest, UpdateProductRequest } from '@/types/Product';
import { productService } from '@/services/productService';

/**
 * Custom hook for fetching all products with React Query and pagination
 */
export const useProducts = (params?: {
  page?: number;
  size?: number;
  cursor?: string | number;
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getAllProducts(params),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
};

/**
 * Custom hook for fetching a single product by ID
 */
export const useProduct = (productId: number) => {
  return useQuery<Product, Error>({
    queryKey: ['products', productId],
    queryFn: () => productService.getProductById(productId),
    enabled: !!productId,
  });
};

/**
 * Custom hook for fetching products by category
 */
export const useProductsByCategory = (categoryId: string | number, enabled = true) => {
  return useQuery<Product[], Error>({
    queryKey: ['products', 'category', categoryId],
    queryFn: () => productService.getProductsByCategory(categoryId),
    enabled: enabled && !!categoryId,
  });
};

/**
 * Custom hook for searching products
 */
export const useSearchProducts = (params: {
  query: string;
  page?: number;
  size?: number;
  cursor?: string | number;
}, enabled = false) => {
  return useQuery({
    queryKey: ['products', 'search', params],
    queryFn: () => productService.searchProducts(params),
    enabled: enabled && !!params.query && params.query.length > 2,
  });
};

/**
 * Custom hook for creating a product
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newProduct: CreateProductRequest) => 
      productService.createProduct(newProduct),
    onSuccess: () => {
      // Invalidate the products query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

/**
 * Custom hook for updating a product
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductRequest }) => 
      productService.updateProduct(id, data),
    onSuccess: (updatedProduct) => {
      // Update specific product in cache
      queryClient.setQueryData(['products', updatedProduct.id], updatedProduct);
      // Invalidate all products lists
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

/**
 * Custom hook for deleting a product
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productId: number) => productService.deleteProduct(productId),
    onSuccess: (_, productId) => {
      // Remove from specific product cache
      queryClient.removeQueries({ queryKey: ['products', productId] });
      // Invalidate the products list
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

/**
 * Custom hook for fetching products by category with cursor-based pagination
 */
export const useProductsByCategoryPaginated = (categoryId: number, params?: {
  page?: number;
  size?: number;
  cursor?: string | number;
}, enabled = true) => {
  return useQuery({
    queryKey: ['products', 'category', categoryId, 'paginated', params],
    queryFn: () => productService.getProductsByCategoryPaginated(categoryId, params),
    enabled: enabled && !!categoryId,
  });
};

/**
 * Custom hook for fetching previous page of products by category
 */
export const useProductsByCategoryPreviousPage = (categoryId: number, params: {
  page?: number;
  size?: number;
  cursor: string | number;
}, enabled = false) => {
  return useQuery({
    queryKey: ['products', 'category', categoryId, 'previous', params],
    queryFn: () => productService.getProductsByCategoryPreviousPage(categoryId, params),
    enabled: enabled && !!categoryId && !!params.cursor,
  });
};

/**
 * Custom hook for filtering products with advanced criteria
 */
export const useFilterProducts = (filterParams: {
  page?: number;
  size?: number;
  cursor?: string | number;
  name?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  startDate?: string;
  endDate?: string;
}, enabled = true) => {
  return useQuery({
    queryKey: ['products', 'filter', filterParams],
    queryFn: () => productService.filterProducts(filterParams),
    enabled: enabled,
  });
};
