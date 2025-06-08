'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Card from '@/components/Card';
import { List, ListItem } from '@/components/List';
import Chip from '@/components/Chip';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import Snackbar from '@/components/Snackbar';
import ImageUploadZone from '@/components/ImageUploadZone';
import { Category } from '@/types/Category';
import { useCategories, useDeleteCategory } from '@/hooks/useCategories';
import { useSnackbar } from '@/hooks/useSnackbar';
import { categoryService } from '@/services/categoryService';
import { t } from '@/utils/localization';

interface CategoryFormData {
  name: string;
  description: string;
  imageUrl: string;
}

interface CategoriesManagementProps {
  title?: string;
  className?: string;
  onCategorySelect?: (category: Category) => void;
  onCategoryUpdate?: (category: Category) => void;
  showActions?: boolean;
}

export default function CategoriesManagement({ 
  title = t('sections.categoriesManagement'),
  className = "",
  onCategorySelect,
  onCategoryUpdate,
  showActions = true
}: CategoriesManagementProps) {
  // State management
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    imageUrl: ''
  });

  // TanStack Query hooks
  const { 
    data: categories = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useCategories();
  
  const deleteCategory = useDeleteCategory();
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  // Form handlers
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      imageUrl: ''
    });
  };

  const handleCreateCategory = async () => {
    try {
      if (!formData.name.trim()) {
        showSnackbar(t('form.validation.required'), 'error');
        return;
      }

      const createRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        imageUrl: formData.imageUrl || undefined
      };

      const newCategory = await categoryService.createCategory(createRequest);
      
      showSnackbar(t('messages.success.created'), 'success');
      setIsAddingCategory(false);
      resetForm();
      refetch();
      onCategoryUpdate?.(newCategory);
    } catch (error) {
      console.error('Error creating category:', error);
      showSnackbar(t('messages.error.general'), 'error');
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      const updateRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        imageUrl: formData.imageUrl || undefined
      };

      const updatedCategory = await categoryService.updateCategory(editingCategory.id, updateRequest);
      
      showSnackbar(t('messages.success.updated'), 'success');
      setEditingCategory(null);
      resetForm();
      refetch();
      onCategoryUpdate?.(updatedCategory);
    } catch (error) {
      console.error('Error updating category:', error);
      showSnackbar(t('messages.error.general'), 'error');
    }
  };

  const handleEditCategory = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      imageUrl: category.imageUrl || ''
    });
    setEditingCategory(category);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm(t('messages.confirmation.delete'))) return;

    try {
      await deleteCategory.mutateAsync(categoryId);
      showSnackbar(t('messages.success.deleted'), 'success');
    } catch (error) {
      console.error('Error deleting category:', error);
      showSnackbar(t('messages.error.general'), 'error');
    }
  };

  const handleCategoryClick = (category: Category) => {
    onCategorySelect?.(category);
  };

  const handleRefresh = () => {
    refetch();
  };

  const getProductCountColor = (count: number): 'error' | 'tertiary' | 'secondary' => {
    if (count === 0) return 'error';
    if (count < 5) return 'tertiary';
    return 'secondary';
  };

  const filteredCategories = categories.filter((category: Category) => {
    const matchesSearch = !searchQuery || 
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  // Show success message when categories are loaded after a refresh
  useEffect(() => {
    if (!isLoading && categories.length > 0 && !isError) {
      const isManualRefresh = sessionStorage.getItem('categories-manual-refresh');
      if (isManualRefresh) {
        showSnackbar(`${categories.length} ${t('categories.categoriesManagement')} ${t('messages.success.loaded')}!`, 'success');
        sessionStorage.removeItem('categories-manual-refresh');
      }
    }
  }, [isLoading, categories.length, isError, showSnackbar]);

  // Loading state
  if (isLoading && categories.length === 0) {
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

  // Category form component
  const CategoryForm = ({ isEditing }: { isEditing: boolean }) => (
    <Card variant="elevated" className="mb-6 p-6">
      <h3 className="text-lg font-semibold text-(--md-sys-color-on-surface) mb-4">
        {isEditing ? t('categories.editCategory') : t('categories.addCategory')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <TextField
          label={t('categories.categoryName')}
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder={t('form.placeholder.name')}
          required
        />
        
        <TextField
          label={t('categories.categoryDescription')}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder={t('form.placeholder.description')}
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-(--md-sys-color-on-surface) mb-2">
          {t('categories.categoryImage')}
        </label>
        <ImageUploadZone
          value={formData.imageUrl}
          onChange={(imageUrl: string) => {
            setFormData(prev => ({
              ...prev,
              imageUrl
            }));
          }}
          label={t('products.uploadImages')}
        />
        
        {formData.imageUrl && (
          <div className="mt-4">
            <div className="relative w-32 h-32">
              <Image
                src={formData.imageUrl}
                alt="Category preview"
                width={128}
                height={128}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                className="absolute -top-2 -right-2 bg-(--md-sys-color-error) text-(--md-sys-color-on-error) rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-(--md-sys-color-error-container) transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          variant="outlined"
          label={t('actions.cancel')}
          onClick={() => {
            if (isEditing) {
              setEditingCategory(null);
            } else {
              setIsAddingCategory(false);
            }
            resetForm();
          }}
        />
        <Button
          variant="filled"
          label={isEditing ? t('actions.update') : t('actions.create')}
          onClick={isEditing ? handleUpdateCategory : handleCreateCategory}
          disabled={!formData.name.trim()}
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
              label={t('categories.addCategory')} 
              hasLabel
              onClick={() => setIsAddingCategory(true)}
            />
          )}
        </div>
      </div>

      {/* Search */}
      <Card variant="elevated" className="p-4 mb-6">
        <TextField
          label={t('categories.searchCategories')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('categories.searchCategoriesPlaceholder')}
          leadingIcon="search"
        />
      </Card>

      {/* Add Category Form */}
      {isAddingCategory && <CategoryForm isEditing={false} />}

      {/* Edit Category Form */}
      {editingCategory && <CategoryForm isEditing={true} />}
      
      {/* Categories List */}
      {isError ? (
        <Card variant="outlined" className="text-center py-12 border-2 border-(--md-sys-color-error-container)">
          <div className="flex flex-col items-center justify-center">
            <span className="mdi text-3xl mb-2 text-(--md-sys-color-error)">error</span>
            <div className="text-(--md-sys-color-error) text-lg font-medium mb-4">
              {error?.message || t('categories.failedToLoadCategories')}
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
      ) : filteredCategories.length === 0 ? (
        <Card variant="outlined" className="text-center py-12">
          <div className="flex flex-col items-center justify-center">
            <span className="mdi text-4xl mb-4 text-(--md-sys-color-on-surface-variant)">category</span>
            <div className="text-(--md-sys-color-on-surface) text-lg font-medium mb-2">
              {searchQuery ? t('categories.noCategoriesFound') : t('categories.noCategoriesAvailable')}
            </div>
            <div className="text-(--md-sys-color-on-surface-variant) mb-4">
              {searchQuery 
                ? t('messages.info.noData')
                : t('messages.info.noData')
              }
            </div>
            {showActions && !searchQuery && (
              <Button
                variant="filled"
                hasIcon
                icon="add"
                label={t('categories.addCategory')}
                onClick={() => setIsAddingCategory(true)}
              />
            )}
          </div>
        </Card>
      ) : (
        <Card variant="elevated">
          <List>
            {filteredCategories.map((category: Category) => (
              <ListItem 
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                leading={
                  <div className="h-16 w-16 rounded-lg bg-(--md-sys-color-surface-container-highest) flex items-center justify-center overflow-hidden">
                    {category.imageUrl ? (
                      <Image 
                        src={category.imageUrl} 
                        alt={category.name}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-(--md-sys-color-on-surface-variant) text-xl mdi">category</span>
                    )}
                  </div>
                }
                trailing={
                  <div className="flex items-center gap-1 sm:gap-3">
                    <div className="flex flex-col items-end gap-1">
                      <Chip
                        variant="assist"
                        color={getProductCountColor(category.productCount || 0)}
                        label={`${category.productCount || 0} ${t('categories.productCount')}`}
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
                            handleEditCategory(category);
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
                            handleEditCategory(category);
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
                            handleDeleteCategory(category.id);
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
                            handleDeleteCategory(category.id);
                          }}
                        />
                      </div>
                    )}
                  </div>
                }
                supportingText={category.description || t('form.description')}
              >
                <div className="font-medium text-(--md-sys-color-on-surface)">
                  {category.name}
                </div>
              </ListItem>
            ))}
          </List>
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
