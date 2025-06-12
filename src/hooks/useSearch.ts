import { useQuery, useInfiniteQuery, useMutation } from '@tanstack/react-query';
import React, { useState, useCallback, useMemo } from 'react';
import { 
  SearchService, 
  SearchRequest
} from '@/services/searchService';

/**
 * Enhanced search hooks for the new Elasticsearch-powered search
 */

// Query keys for react-query
export const searchKeys = {
  all: ['search'] as const,
  searches: (params: SearchRequest) => [...searchKeys.all, 'products', params] as const,
  suggestions: (query: string) => [...searchKeys.all, 'suggestions', query] as const,
  facets: (params: SearchRequest) => [...searchKeys.all, 'facets', params] as const,
  popular: () => [...searchKeys.all, 'popular'] as const,
};

/**
 * Enhanced search hook with full Elasticsearch capabilities
 */
export function useAdvancedSearch(request: SearchRequest, enabled = true) {
  return useQuery({
    queryKey: searchKeys.searches(request),
    queryFn: () => SearchService.searchProducts(request),
    enabled: enabled && (!!request.query || Object.keys(request.filters || {}).length > 0),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Quick search hook for simple queries
 */
export function useQuickSearch(
  query: string, 
  options: {
    type?: 'EXACT' | 'FUZZY' | 'WILDCARD' | 'PHRASE_PREFIX' | 'MULTI_MATCH';
    categories?: number[];
    minPrice?: number;
    maxPrice?: number;
    brands?: string[];
    inStock?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
    suggestions?: boolean;
    facets?: boolean;
    highlight?: boolean;
  } = {},
  enabled = true
) {
  const searchParams = useMemo(() => ({
    q: query,
    type: options.type || 'FUZZY',
    ...options
  }), [query, options]);

  return useQuery({
    queryKey: ['quickSearch', searchParams],
    queryFn: () => SearchService.quickSearch(searchParams),
    enabled: enabled && !!query.trim(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Infinite scroll search hook for pagination
 */
export function useInfiniteSearch(baseRequest: Omit<SearchRequest, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['infiniteSearch', baseRequest],
    queryFn: ({ pageParam = 0 }) => 
      SearchService.searchProducts({ ...baseRequest, page: pageParam }),
    getNextPageParam: (lastPage) => 
      lastPage.metadata.hasNext ? lastPage.metadata.page + 1 : undefined,
    initialPageParam: 0,
    enabled: !!baseRequest.query || Object.keys(baseRequest.filters || {}).length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Search suggestions hook with debouncing
 */
export function useSearchSuggestions(query: string, limit = 10, debounceMs = 300) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce the query
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return useQuery({
    queryKey: searchKeys.suggestions(debouncedQuery),
    queryFn: () => SearchService.getSuggestions(debouncedQuery, limit),
    enabled: debouncedQuery.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Search facets hook
 */
export function useSearchFacets(request: SearchRequest, enabled = true) {
  return useQuery({
    queryKey: searchKeys.facets(request),
    queryFn: () => SearchService.getFacets(request),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Popular queries hook
 */
export function usePopularQueries(limit = 10) {
  return useQuery({
    queryKey: searchKeys.popular(),
    queryFn: () => SearchService.getPopularQueries(limit),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Search click tracking mutation
 */
export function useSearchClickTracking() {
  return useMutation({
    mutationFn: ({ query, productId, position }: { 
      query: string; 
      productId: string; 
      position: number; 
    }) => SearchService.logSearchClick(query, productId, position),
    // Don't show errors to user - analytics failures shouldn't interrupt UX
    onError: (error) => {
      console.warn('Failed to track search click:', error);
    },
  });
}

/**
 * Enhanced search state management hook
 */
export function useSearchState() {
  const [searchRequest, setSearchRequest] = useState<SearchRequest>({
    query: '',
    searchType: 'FUZZY',
    page: 0,
    size: 20,
    sortBy: 'relevance',
    sortDirection: 'DESC',
    includeSuggestions: true,
    includeFacets: true,
    highlightResults: true,
    filters: {}
  });

  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Update search query
  const updateQuery = useCallback((query: string) => {
    setSearchRequest(prev => ({ ...prev, query, page: 0 }));
    
    // Add to search history
    if (query.trim() && !searchHistory.includes(query)) {
      setSearchHistory(prev => [query, ...prev.slice(0, 9)]); // Keep last 10 searches
    }
  }, [searchHistory]);

  // Update search filters
  const updateFilters = useCallback((filters: Partial<SearchRequest['filters']>) => {
    setSearchRequest(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
      page: 0 // Reset to first page when filters change
    }));
  }, []);

  // Update sorting
  const updateSort = useCallback((sortBy: string, sortDirection: 'ASC' | 'DESC' = 'DESC') => {
    setSearchRequest(prev => ({ ...prev, sortBy, sortDirection, page: 0 }));
  }, []);

  // Update pagination
  const updatePage = useCallback((page: number) => {
    setSearchRequest(prev => ({ ...prev, page }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchRequest(prev => ({
      ...prev,
      filters: {},
      page: 0
    }));
  }, []);

  // Reset entire search state
  const resetSearch = useCallback(() => {
    setSearchRequest({
      query: '',
      searchType: 'FUZZY',
      page: 0,
      size: 20,
      sortBy: 'relevance',
      sortDirection: 'DESC',
      includeSuggestions: true,
      includeFacets: true,
      highlightResults: true,
      filters: {}
    });
  }, []);

  return {
    searchRequest,
    searchHistory,
    updateQuery,
    updateFilters,
    updateSort,
    updatePage,
    resetFilters,
    resetSearch,
    setSearchRequest
  };
}

/**
 * Comprehensive search hook that combines search results, suggestions, and facets
 */
export function useComprehensiveSearch(searchRequest: SearchRequest, enabled = true) {
  const searchResults = useAdvancedSearch(searchRequest, enabled);
  const suggestions = useSearchSuggestions(searchRequest.query || '', 5);
  const facets = useSearchFacets(searchRequest, enabled);
  const clickTracking = useSearchClickTracking();

  const trackProductClick = useCallback((productId: string, position: number) => {
    if (searchRequest.query) {
      clickTracking.mutate({
        query: searchRequest.query,
        productId,
        position
      });
    }
  }, [searchRequest.query, clickTracking]);

  return {
    // Search results
    products: searchResults.data?.results || [],
    metadata: searchResults.data?.metadata,
    highlights: searchResults.data?.highlights,
    
    // Loading states
    isLoading: searchResults.isLoading,
    isLoadingFacets: facets.isLoading,
    isLoadingSuggestions: suggestions.isLoading,
    
    // Error states
    error: searchResults.error,
    facetsError: facets.error,
    suggestionsError: suggestions.error,
    
    // Data
    suggestions: suggestions.data || [],
    facets: facets.data || {},
    
    // Actions
    trackProductClick,
    refetch: searchResults.refetch,
    
    // Status
    isError: searchResults.isError,
    isSuccess: searchResults.isSuccess,
  };
}
