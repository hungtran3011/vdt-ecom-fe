'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Card from '@/components/Card';
import { List, ListItem } from '@/components/List';
import Chip from '@/components/Chip';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import Snackbar from '@/components/Snackbar';
import Pagination from '@/components/Pagination';
import ImageUploadZone from '@/components/ImageUploadZone';
import { Product, CreateProductRequest, UpdateProductRequest } from '@/types/Product';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useSnackbar } from '@/hooks/useSnackbar';
import { usePagination } from '@/hooks/usePagination';
import { productService } from '@/services/productService';
import { formatVND } from '@/utils/currency';
import { t } from '@/utils/localization';

interface ProductFormData {
  name: string;
  description: string;
  basePrice: number;
  categoryId: number;
  images: string[];
}

interface ProductsManagementProps {
  title?: string;
  className?: string;
  onProductSelect?: (product: Product) => void;
  onProductUpdate?: (product: Product) => void;
  showActions?: boolean;
}

export default function ProductsManagement({ 
  title = t('sections.productsManagement'),
  className = "",
  onProductSelect,
  onProductUpdate,
  showActions = true
}: ProductsManagementProps) {
  // State management
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    basePrice: 0,
    categoryId: 0,
    images: []
  });

  // Pagination state
  const pagination = usePagination();

  // TanStack Query hooks
  const { 
    data: productsData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useProducts({
    page: pagination.paginationParams.page,
    size: pagination.paginationParams.size,
    cursor: pagination.paginationParams.cursor,
    search: searchQuery,
    categoryId: selectedCategory || undefined
  });
  
  const products = productsData?.data || [];
  
  const { data: categoriesData } = useCategories();
  const categories = categoriesData || [];
  
  const deleteProduct = useDeleteProduct();
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  // Form handlers
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      basePrice: 0,
      categoryId: categories[0]?.id || 0,
      images: []
    });
  };

  const handleCreateProduct = async () => {
    try {
      if (!formData.name.trim()) {
        showSnackbar(t('form.validation.required'), 'error');
        return;
      }

      const createRequest: CreateProductRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        basePrice: formData.basePrice,
        categoryId: formData.categoryId,
        images: formData.images
      };

      const newProduct = await productService.createProduct(createRequest);
      
      showSnackbar(t('messages.success.created'), 'success');
      setIsAddingProduct(false);
      resetForm();
      refetch();
      onProductUpdate?.(newProduct);
    } catch (error) {
      console.error('Error creating product:', error);
      showSnackbar(t('messages.error.general'), 'error');
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      const updateRequest: UpdateProductRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        basePrice: formData.basePrice,
        categoryId: formData.categoryId,
        images: formData.images
      };

      const updatedProduct = await productService.updateProduct(editingProduct.id, updateRequest);
      
      showSnackbar(t('messages.success.updated'), 'success');
      setEditingProduct(null);
      resetForm();
      refetch();
      onProductUpdate?.(updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
      showSnackbar(t('messages.error.general'), 'error');
    }
  };

  const handleEditProduct = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      basePrice: product.basePrice,
      categoryId: product.categoryId || categories[0]?.id || 0,
      images: product.images || []
    });
    setEditingProduct(product);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm(t('messages.confirmation.delete'))) return;

    try {
      await deleteProduct.mutateAsync(productId);
      showSnackbar(t('messages.success.deleted'), 'success');
    } catch (error) {
      console.error('Error deleting product:', error);
      showSnackbar(t('messages.error.general'), 'error');
    }
  };

  const handleProductClick = (product: Product) => {
    onProductSelect?.(product);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleImageRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const getStockStatus = (): 'tertiary' | 'secondary' | 'error' => {
    const stockLevel = Math.random();
    if (stockLevel > 0.5) return 'tertiary';
    if (stockLevel > 0.1) return 'secondary';
    return 'error';
  };

  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Loading state
  if (isLoading && products.length === 0) {
    return (
      <div className={className}>
        <h2 className="text-2xl font-bold text-(--md-sys-color-on-surface) mb-6">{title}</h2>
        <Card variant="elevated" className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-(--md-sys-color-outline-variant) rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-(--md-sys-color-outline-variant) rounded w-3/4"></div>
                  <div className="h-3 bg-(--md-sys-color-outline-variant) rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Product form component
  const ProductForm = ({ isEditing }: { isEditing: boolean }) => (
    <Card variant="elevated" className="mb-6 p-6">
      <h3 className="text-lg font-semibold text-(--md-sys-color-on-surface) mb-4">
        {isEditing ? t('products.editProduct') : t('products.addProduct')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <TextField
          label={t('products.productName')}
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder={t('form.placeholder.name')}
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-(--md-sys-color-on-surface) mb-1">
            {t('form.category')}
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData(prev => ({ ...prev, categoryId: parseInt(e.target.value) }))}
            className="w-full p-3 border border-(--md-sys-color-outline) rounded-lg bg-(--md-sys-color-surface) text-(--md-sys-color-on-surface) focus:border-(--md-sys-color-primary) focus:outline-none"
          >
            <option value={0}>{t('products.allCategories')}</option>              {categories.map((category: { id: number; name: string }) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <TextField
          label={t('products.productDescription')}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder={t('form.placeholder.description')}
        />
      </div>

      <div className="mb-4">
        <TextField
          label={t('products.basePrice')}
          type="number"
          value={formData.basePrice.toString()}
          onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
          placeholder={t('form.placeholder.price')}
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-(--md-sys-color-on-surface) mb-2">
          {t('products.images')}
        </label>
        <ImageUploadZone
          value=""
          onChange={(imageUrl: string) => {
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, imageUrl]
            }));
          }}
          label={t('products.uploadImages')}
        />
        
        {formData.images.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative">
                <Image
                  src={image}
                  alt={`Product image ${index + 1}`}
                  width={100}
                  height={100}
                  className="w-full h-20 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleImageRemove(index)}
                  className="absolute -top-2 -right-2 bg-(--md-sys-color-error) text-(--md-sys-color-on-error) rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-(--md-sys-color-error-container) transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          variant="outlined"
          label={t('actions.cancel')}
          onClick={() => {
            if (isEditing) {
              setEditingProduct(null);
            } else {
              setIsAddingProduct(false);
            }
            resetForm();
          }}
        />
        <Button
          variant="filled"
          label={isEditing ? t('actions.update') : t('actions.create')}
          onClick={isEditing ? handleUpdateProduct : handleCreateProduct}
          disabled={!formData.name.trim() || formData.basePrice <= 0}
        />
      </div>
    </Card>
  );

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-(--md-sys-color-on-surface)">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            hasIcon
            icon="refresh"
            label={t('actions.refresh')}
            hasLabel
            onClick={handleRefresh}
            disabled={isLoading}
            className="sm:flex hidden"
          />
          <Button
            variant="outlined"
            hasIcon
            icon="refresh"
            hasLabel={false}
            onClick={handleRefresh}
            disabled={isLoading}
            className="sm:hidden flex"
          />
          {showActions && (
            <Button
              variant="filled"
              hasIcon
              icon="add"
              label={t('products.addProduct')} 
              hasLabel
              onClick={() => setIsAddingProduct(true)}
            />
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <Card variant="elevated" className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label={t('products.searchProducts')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('products.searchProductsPlaceholder')}
            leadingIcon="search"
          />
          
          <div>
            <label className="block text-sm font-medium text-(--md-sys-color-on-surface) mb-1">
              {t('form.category')}
            </label>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full p-3 border border-(--md-sys-color-outline) rounded-lg bg-(--md-sys-color-surface) text-(--md-sys-color-on-surface) focus:border-(--md-sys-color-primary) focus:outline-none"
            >
              <option value="">{t('products.allCategories')}</option>
              {categories.map((category: { id: number; name: string }) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Add Product Form */}
      {isAddingProduct && <ProductForm isEditing={false} />}

      {/* Edit Product Form */}
      {editingProduct && <ProductForm isEditing={true} />}
      
      {/* Products List */}
      {isError ? (
        <Card variant="outlined" className="text-center py-12 border-2 border-(--md-sys-color-error-container)">
          <div className="flex flex-col items-center justify-center">
            <span className="mdi text-3xl mb-2 text-(--md-sys-color-error)">error</span>
            <div className="text-(--md-sys-color-error) text-lg font-medium mb-4">
              {error?.message || t('products.failedToLoadProducts')}
            </div>
            <Button 
              variant="filled"
              onClick={handleRefresh}
              label={t('actions.refresh')}
              hasIcon
              icon="refresh"
            />
          </div>
        </Card>
      ) : filteredProducts.length === 0 ? (
        <Card variant="outlined" className="text-center py-12">
          <div className="flex flex-col items-center justify-center">
            <span className="mdi text-4xl mb-4 text-(--md-sys-color-on-surface-variant)">inventory_2</span>
            <div className="text-(--md-sys-color-on-surface) text-lg font-medium mb-2">
              {searchQuery || selectedCategory ? t('products.noProductsFound') : t('products.noProductsAvailable')}
            </div>
            <div className="text-(--md-sys-color-on-surface-variant) mb-4">
              {searchQuery || selectedCategory 
                ? t('messages.info.noData')
                : t('messages.info.noData')
              }
            </div>
            {showActions && !searchQuery && !selectedCategory && (
              <Button
                variant="filled"
                hasIcon
                icon="add"
                label={t('products.addProduct')}
                onClick={() => setIsAddingProduct(true)}
              />
            )}
          </div>
        </Card>
      ) : (
        <Card variant="elevated">
          <List>
            {filteredProducts.map((product: Product) => (
              <ListItem 
                key={product.id}
                onClick={() => handleProductClick(product)}
                leading={
                  <div className="h-16 w-16 rounded-lg bg-(--md-sys-color-surface-container-highest) flex items-center justify-center overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <Image 
                        src={product.images[0]} 
                        alt={product.name}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-(--md-sys-color-on-surface-variant) text-xl mdi">image</span>
                    )}
                  </div>
                }
                trailing={
                  <div className="flex items-center gap-1 sm:gap-3">
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-sm font-semibold text-(--md-sys-color-primary)">
                        {formatVND(product.basePrice)}
                      </div>
                      <Chip
                        variant="assist"
                        color={getStockStatus()}
                        label={t('stock.available')}
                        selected
                        className="text-xs"
                      />
                    </div>
                    {showActions && (
                      <div className="flex gap-1 sm:gap-2">
                        <Button
                          variant="text"
                          hasIcon
                          icon="edit"
                          label={t('actions.edit')}
                          hasLabel
                          className="sm:flex hidden"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProduct(product);
                          }}
                        />
                        <Button
                          variant="text"
                          hasIcon
                          icon="edit"
                          hasLabel={false}
                          className="sm:hidden flex"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProduct(product);
                          }}
                        />
                        <Button
                          variant="text"
                          hasIcon
                          icon="delete"
                          label={t('actions.delete')}
                          hasLabel
                          className="sm:flex hidden"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProduct(product.id);
                          }}
                        />
                        <Button
                          variant="text"
                          hasIcon
                          icon="delete"
                          hasLabel={false}
                          className="sm:hidden flex"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProduct(product.id);
                          }}
                        />
                      </div>
                    )}
                  </div>
                }
                supportingText={`${product.category?.name || t('form.category')} • ${product.variations?.length || 0} ${t('products.variations')}`}
              >
                <div className="font-medium text-(--md-sys-color-on-surface)">
                  {product.name}
                </div>
              </ListItem>
            ))}
          </List>
          
          {/* Pagination */}
          {productsData && (
            <div className="p-4 border-t border-(--md-sys-color-outline-variant)">
              <Pagination
                paginationInfo={pagination.paginationInfo}
                controls={pagination.controls}
              />
            </div>
          )}
        </Card>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        message={snackbar.message}
        isOpen={snackbar.isOpen}
        onClose={hideSnackbar}
        severity={snackbar.severity}
        action={snackbar.action}
      />
    </div>
  );
}
