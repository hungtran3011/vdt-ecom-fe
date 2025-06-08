'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Card from '@/components/Card';
import { List, ListItem } from '@/components/List';
import Chip from '@/components/Chip';
import Button from '@/components/Button';
import { Category, CategoryManagementProps } from '@/types/Category';
import AddCategoryForm from './AddCategoryForm';
import EditCategoryForm from './EditCategoryForm';
import Snackbar from '@/components/Snackbar';
import { useCategories, useDeleteCategory } from '@/hooks/useCategories';
import { useSnackbar } from '@/hooks/useSnackbar';

export default function CategoriesManagement({ 
  title = "Categories Management",
  className = "",
  onCategorySelect,
  onCategoryUpdate,
  // fallbackCategories = [
  //   {
  //     id: 1,
  //     name: 'Electronics',
  //     description: 'Electronic devices and accessories',
  //     imageUrl: '/dummy/1.png',
  //     productCount: 25,
  //     createdAt: '2024-01-01T00:00:00Z',
  //     updatedAt: '2024-01-01T00:00:00Z',
  //     dynamicFields: []
  //   },
  //   {
  //     id: 2,
  //     name: 'Clothing',
  //     description: 'Fashion and apparel',
  //     imageUrl: '/dummy/2.png',
  //     productCount: 15,
  //     createdAt: '2024-01-02T00:00:00Z',
  //     updatedAt: '2024-01-02T00:00:00Z',
  //     dynamicFields: []
  //   },
  //   {
  //     id: 3,
  //     name: 'Home & Garden',
  //     description: 'Home improvement and garden supplies',
  //     imageUrl: '/dummy/3.png',
  //     productCount: 10,
  //     createdAt: '2024-01-03T00:00:00Z',
  //     updatedAt: '2024-01-03T00:00:00Z',
  //     dynamicFields: []
  //   }
  // ],
  showActions = true
}: CategoryManagementProps) {
  // Use TanStack Query for data fetching
  const { 
    data: categories = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useCategories();
  
  // Use TanStack Query mutation for deleting categories
  const deleteCategory = useDeleteCategory();
  
  // Snackbar for notifications
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
  
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleCategoryAdded = (newCategory: Category) => {
    setIsAddingCategory(false);
    showSnackbar(`Category "${newCategory.name}" added successfully!`, 'success');
    onCategoryUpdate?.(newCategory);
  };

  const handleCategoryUpdated = (updatedCategory: Category) => {
    setEditingCategory(null);
    showSnackbar(`Category "${updatedCategory.name}" updated successfully!`, 'success');
    onCategoryUpdate?.(updatedCategory);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    const categoryToDelete = categories.find(cat => cat.id === categoryId);
    const categoryName = categoryToDelete?.name || 'Category';

    try {
      await deleteCategory.mutateAsync(categoryId);
      showSnackbar(`"${categoryName}" deleted successfully!`, 'success');
    } catch (error) {
      console.error('Error deleting category:', error);
      showSnackbar(`Failed to delete "${categoryName}"`, 'error');
    }
  };

  const handleCategoryClick = (category: Category) => {
    onCategorySelect?.(category);
  };

  const retryFetch = () => {
    refetch();
  };

  // Show success message when categories are loaded after a refresh
  useEffect(() => {
    if (!isLoading && categories.length > 0 && !isError) {
      // Only show if this is a manual refresh (not initial load)
      const isManualRefresh = sessionStorage.getItem('categories-manual-refresh');
      if (isManualRefresh) {
        showSnackbar(`${categories.length} categories loaded successfully!`, 'success');
        sessionStorage.removeItem('categories-manual-refresh');
      }
    }
  }, [isLoading, categories.length, isError, showSnackbar]);

  const handleRefresh = () => {
    sessionStorage.setItem('categories-manual-refresh', 'true');
    refetch();
  };

  const getProductCountColor = (count: number): 'error' | 'tertiary' | 'secondary' => {
    if (count === 0) return 'error';
    if (count < 5) return 'tertiary';
    return 'secondary';
  };

  // Show loading UI only if we don't have any categories data already
  if (isLoading && categories.length === 0) {
    return (
      <div className={className}>
        <h2 className="text-2xl font-bold text-(--md-sys-color-on-surface) mb-6">{title}</h2>
        <Card variant="elevated" className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-(--md-sys-color-outline-variant) rounded w-3/4"></div>
            <div className="h-4 bg-(--md-sys-color-outline-variant) rounded w-1/2"></div>
            <div className="h-4 bg-(--md-sys-color-outline-variant) rounded w-5/6"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-(--md-sys-color-on-surface)">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            hasIcon
            icon="refresh"
            label="Refresh"
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
              label="Add Category" 
              hasLabel
              onClick={() => setIsAddingCategory(true)}
            />
          )}
        </div>
      </div>
      
      {/* Loading overlay when refreshing with existing data */}
      {isLoading && categories.length > 0 && (
        <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center z-10 rounded">
          <div className="h-6 w-6 border-2 border-t-transparent border-(--md-sys-color-primary) rounded-full animate-spin"></div>
        </div>
      )}

      {/* Add Category Form */}
      {isAddingCategory && (
        <AddCategoryForm 
          onCancel={() => setIsAddingCategory(false)}
          onCategoryAdded={handleCategoryAdded}
        />
      )}

      {/* Edit Category Form */}
      {editingCategory && (
        <EditCategoryForm 
          category={editingCategory}
          onCancel={() => setEditingCategory(null)}
          onCategoryUpdated={handleCategoryUpdated}
        />
      )}
      
      {isError ? (
        <Card variant="outlined" className="text-center py-12 border-2 border-(--md-sys-color-error-container)">
          <div className="flex flex-col items-center justify-center">
            <span className="mdi text-3xl mb-2 text-(--md-sys-color-error)">error</span>
            <div className="text-(--md-sys-color-error) text-lg font-medium mb-4">
              {error?.message || 'Failed to fetch categories'}
            </div>
            <Button 
              variant="filled"
              onClick={retryFetch}
              label="Retry"
              color="error"
              hasIcon
              icon="refresh"
            />
          </div>
        </Card>
      ) : categories.length === 0 ? (
        <Card variant="outlined" className="text-center py-12">
          <div className="flex flex-col items-center justify-center">
            <span className="mdi text-4xl mb-4 text-(--md-sys-color-on-surface-variant)">category</span>
            <div className="text-(--md-sys-color-on-surface) text-lg font-medium mb-2">
              No categories found
            </div>
            <div className="text-(--md-sys-color-on-surface-variant) mb-4">
              Get started by creating your first category
            </div>
            {showActions && (
              <Button
                variant="filled"
                hasIcon
                icon="add"
                label="Add Category"
                onClick={() => setIsAddingCategory(true)}
              />
            )}
          </div>
        </Card>
      ) : (
        <Card variant="elevated">
          <List>
            {categories.map((category) => (
              <ListItem 
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                leading={
                  <div className="h-12 w-12 rounded-lg bg-(--md-sys-color-surface-container-highest) flex items-center justify-center overflow-hidden">
                    {category.imageUrl ? (
                      <Image 
                        src={category.imageUrl} 
                        alt={category.name}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-(--md-sys-color-on-surface-variant) text-lg">📂</span>
                    )}
                  </div>
                }
                trailing={
                  <div className="flex items-center gap-1 sm:gap-3">
                    <Chip
                      variant="assist"
                      color={getProductCountColor(category.productCount || 0)}
                      label={`${category.productCount || 0}`}
                      selected
                    />
                    {showActions && (
                      <div className="flex gap-1 sm:gap-2">
                        <Button
                          variant="text"
                          hasIcon
                          icon="edit"
                          label="Edit"
                          hasLabel
                          className="sm:flex hidden"
                          disabled={!!(category.productCount && category.productCount > 0)}
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
                          disabled={!!(category.productCount && category.productCount > 0)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCategory(category);
                          }}
                        />
                        <Button
                          variant="text"
                          hasIcon
                          icon="delete"
                          label="Delete"
                          hasLabel
                          className="sm:flex hidden"
                          disabled={!!(category.productCount && category.productCount > 0)}
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
                          disabled={!!(category.productCount && category.productCount > 0)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(category.id);
                          }}
                        />
                      </div>
                    )}
                  </div>
                }
                supportingText={category.description}
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
