'use client';

import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/productService';

/**
 * Custom hook for getting search suggestions
 */
export const useSearchSuggestions = (query: string, enabled = false) => {
  return useQuery({
    queryKey: ['searchSuggestions', query],
    queryFn: async () => {
      // For now, we'll use a simple approach by searching products
      // and extracting unique product names as suggestions
      if (!query || query.length < 2) return [];
      
      try {
        const searchResults = await productService.searchProducts({ 
          query, 
          size: 10 
        });
        
        // Extract unique product names and related terms
        const suggestions = new Set<string>();
        
        if (searchResults?.content) {
          searchResults.content.forEach((product: any) => {
            if (product.name) {
              // Add the full product name
              suggestions.add(product.name);
              
              // Add words from the product name
              const words = product.name.toLowerCase().split(' ');
              words.forEach(word => {
                if (word.length > 2 && word.includes(query.toLowerCase())) {
                  suggestions.add(word);
                }
              });
            }
          });
        }
        
        return Array.from(suggestions).slice(0, 8);
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
        return [];
      }
    },
    enabled: enabled && !!query && query.length >= 2,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
};

/**
 * Hook for getting popular search terms (could be enhanced with backend data)
 */
export const usePopularSearchTerms = () => {
  return useQuery({
    queryKey: ['popularSearchTerms'],
    queryFn: async () => {
      // For now, return static popular terms
      // In a real app, this would come from analytics/backend
      return [
        'Điện thoại',
        'Laptop',
        'Thời trang',
        'Mỹ phẩm',
        'Gia dụng',
        'Đồng hồ',
        'Giày dép',
        'Túi xách'
      ];
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};
