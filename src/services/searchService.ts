import api from '@/lib/axios';

/**
 * Enhanced search service for Elasticsearch-powered product search
 */

export interface SearchFilters {
  categoryIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  priceRanges?: string[];
  brands?: string[];
  inStock?: boolean;
  minRating?: number;
  ratings?: number[];
  tags?: string[];
}

export interface SearchRequest {
  query?: string;
  searchType?: 'EXACT' | 'FUZZY' | 'WILDCARD' | 'PHRASE_PREFIX' | 'MULTI_MATCH';
  filters?: SearchFilters;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  includeSuggestions?: boolean;
  includeFacets?: boolean;
  highlightResults?: boolean;
}

export interface SearchSuggestion {
  text: string;
  score: number;
  type: 'SPELL_CHECK' | 'COMPLETION' | 'PHRASE' | 'TERM';
  frequency: number;
}

export interface FacetResult {
  key: string;
  count: number;
  selected: boolean;
  metadata?: Record<string, unknown>;
}

export interface SearchMetadata {
  query: string;
  totalHits: number;
  page: number;
  size: number;
  totalPages: number;
  maxScore: number;
  searchTime: number;
  hasNext: boolean;
  hasPrevious: boolean;
  scrollId?: string;
}

export interface ProductSearchDocument {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  categoryId?: number;
  categoryName?: string;
  categoryHierarchy?: string[];
  basePrice: number;
  salePrice?: number;
  onSale: boolean;
  discountPercentage: number;
  inStock: boolean;
  stockQuantity?: number;
  lowStock: boolean;
  brand?: string;
  manufacturer?: string;
  tags?: string[];
  colors?: string[];
  sizes?: string[];
  material?: string;
  averageRating: number;
  reviewCount: number;
  imageUrls?: string[];
  primaryImageUrl?: string;
  metaDescription?: string;
  keywords?: string[];
  createdAt?: string;
  updatedAt?: string;
  lastIndexed?: string;
  autocompleteText?: string;
  searchableText?: string;
  viewCount: number;
  orderCount: number;
  popularityScore: number;
  searchRankingScore: number;
  customAttributes?: Record<string, unknown>;
  variationIds?: string[];
  parentProductId?: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  location?: string;
  isActive: boolean;
  isVisible: boolean;
  status: string;
}

export interface SearchResponse {
  results: ProductSearchDocument[];
  metadata: SearchMetadata;
  suggestions?: SearchSuggestion[];
  facets?: Record<string, FacetResult[]>;
  highlights?: Record<string, string[]>;
}

export class SearchService {
  private static readonly BASE_URL = '/v1/search';

  /**
   * Perform advanced product search with full Elasticsearch capabilities
   */
  static async searchProducts(request: SearchRequest): Promise<SearchResponse> {
    try {
      console.log('SearchService: Performing advanced search with request:', request);
      
      const response = await api.post(`${this.BASE_URL}/products`, request);
      
      console.log('SearchService: Search response:', response.data);
      return response.data;
    } catch (error) {
      console.error('SearchService: Error in searchProducts:', error);
      throw error;
    }
  }

  /**
   * Quick search with query parameters (for simple searches)
   */
  static async quickSearch(params: {
    q?: string;
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
  }): Promise<SearchResponse> {
    try {
      console.log('SearchService: Performing quick search with params:', params);
      
      const queryParams = new URLSearchParams();
      
      if (params.q) queryParams.append('q', params.q);
      if (params.type) queryParams.append('type', params.type);
      if (params.categories) params.categories.forEach(cat => queryParams.append('categories', cat.toString()));
      if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
      if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
      if (params.brands) params.brands.forEach(brand => queryParams.append('brands', brand));
      if (params.inStock !== undefined) queryParams.append('inStock', params.inStock.toString());
      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.size !== undefined) queryParams.append('size', params.size.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      if (params.suggestions) queryParams.append('suggestions', params.suggestions.toString());
      if (params.facets) queryParams.append('facets', params.facets.toString());
      if (params.highlight) queryParams.append('highlight', params.highlight.toString());

      const response = await api.get(`${this.BASE_URL}/products?${queryParams.toString()}`);
      
      console.log('SearchService: Quick search response:', response.data);
      return response.data;
    } catch (error) {
      console.error('SearchService: Error in quickSearch:', error);
      throw error;
    }
  }

  /**
   * Get search suggestions for autocomplete
   */
  static async getSuggestions(query: string, limit: number = 10): Promise<SearchSuggestion[]> {
    try {
      console.log(`SearchService: Getting suggestions for query: "${query}"`);
      
      const response = await api.get(`${this.BASE_URL}/suggestions`, {
        params: { q: query, limit }
      });
      
      console.log('SearchService: Suggestions response:', response.data);
      return response.data;
    } catch (error) {
      console.error('SearchService: Error getting suggestions:', error);
      return [];
    }
  }

  /**
   * Get search facets for filter UI
   */
  static async getFacets(request: SearchRequest): Promise<Record<string, FacetResult[]>> {
    try {
      console.log('SearchService: Getting facets for request:', request);
      
      const response = await api.post(`${this.BASE_URL}/facets`, request);
      
      console.log('SearchService: Facets response:', response.data);
      return response.data;
    } catch (error) {
      console.error('SearchService: Error getting facets:', error);
      return {};
    }
  }

  /**
   * Get popular search queries
   */
  static async getPopularQueries(limit: number = 10): Promise<string[]> {
    try {
      const response = await api.get(`${this.BASE_URL}/popular`, {
        params: { limit }
      });
      
      return response.data;
    } catch (error) {
      console.error('SearchService: Error getting popular queries:', error);
      return [];
    }
  }

  /**
   * Log search result click for analytics
   */
  static async logSearchClick(query: string, productId: string, position: number): Promise<void> {
    try {
      await api.post(`${this.BASE_URL}/click`, null, {
        params: { query, productId, position }
      });
    } catch (error) {
      console.error('SearchService: Error logging search click:', error);
      // Don't throw - analytics shouldn't break user experience
    }
  }

  /**
   * Check search service health
   */
  static async checkHealth(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await api.get(`${this.BASE_URL}/health`);
      return response.data;
    } catch (error) {
      console.error('SearchService: Health check failed:', error);
      throw error;
    }
  }
}
