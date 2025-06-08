'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import TextArea from '@/components/TextArea';
import Select from '@/components/Select';
import Checkbox from '@/components/Checkbox';
import SegmentedButton from '@/components/SegmentedButton';
import ImageUploadZone from '@/components/ImageUploadZone';
import Snackbar from '@/components/Snackbar';
import { Category, CategoryDynamicField, UpdateCategoryRequest } from '@/types/Category';
import { useUpdateCategory } from '@/hooks/useCategories';
import { useSnackbar } from '@/hooks/useSnackbar';

interface EditCategoryFormProps {
  category: Category;
  onCancel: () => void;
  onCategoryUpdated: (category: Category) => void;
}

interface EditCategoryForm {
  name: string;
  description: string;
  imageUrl: string;
  dynamicFields: (CategoryDynamicField & { tempId?: string })[];
}

const FIELD_TYPE_OPTIONS = [
  { value: 'TEXT', label: 'Text' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'BOOLEAN', label: 'Boolean' },
  { value: 'DATE', label: 'Date' },
  { value: 'COLOR_HASH', label: 'Color' },
  { value: 'ENUM', label: 'Dropdown' },
];

const APPLIES_TO_OPTIONS = [
  { value: 'PRODUCT', label: 'Product' },
  { value: 'VARIATION', label: 'Variation' },
];

const TAB_OPTIONS = [
  { value: 'basic', label: 'Basic Info', icon: 'info' },
  { value: 'advanced', label: 'Dynamic Fields', icon: 'tune' },
];

export default function EditCategoryForm({ category, onCancel, onCategoryUpdated }: EditCategoryFormProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [editCategory, setEditCategory] = useState<EditCategoryForm>({
    name: category.name,
    description: category.description || '',
    imageUrl: category.imageUrl || '',
    dynamicFields: category.dynamicFields?.map(field => ({ ...field })) || []
  });
  
  // Use TanStack Query mutation for updating categories
  const updateCategory = useUpdateCategory();
  
  // Snackbar for notifications
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory.name.trim()) return;

    try {
      // Create the category data to send to the API
      const categoryData: UpdateCategoryRequest = {
        name: editCategory.name.trim(),
        description: editCategory.description.trim() || undefined,
        imageUrl: editCategory.imageUrl.trim() || undefined,
        dynamicFields: editCategory.dynamicFields.length > 0 ? editCategory.dynamicFields : undefined
      };

      const updatedCategory = await updateCategory.mutateAsync({
        id: category.id,
        data: categoryData
      });
      onCategoryUpdated(updatedCategory);
      showSnackbar(`Category "${updatedCategory.name}" updated successfully!`, 'success');
    } catch (error) {
      console.error('Error updating category:', error);
      showSnackbar(`Failed to update category "${editCategory.name}"`, 'error');
      // Error handling is managed by TanStack Query
    }
  };

  const addDynamicField = () => {
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    setEditCategory({
      ...editCategory,
      dynamicFields: [
        ...editCategory.dynamicFields,
        {
          id: 0, // Will be assigned by backend
          fieldName: '',
          fieldType: 'TEXT',
          appliesTo: 'PRODUCT',
          required: false,
          tempId
        }
      ]
    });
  };

  const removeDynamicField = (index: number) => {
    setEditCategory({
      ...editCategory,
      dynamicFields: editCategory.dynamicFields.filter((_, i) => i !== index)
    });
  };

  const updateDynamicField = (index: number, field: Partial<CategoryDynamicField>) => {
    const updatedFields = [...editCategory.dynamicFields];
    updatedFields[index] = { ...updatedFields[index], ...field };
    setEditCategory({
      ...editCategory,
      dynamicFields: updatedFields
    });
  };

  return (
    <Card variant="elevated" className="mb-6 overflow-visible">
      {/* Header */}
      <div className="bg-(--md-sys-color-secondary-container) p-6 pb-4">
        <h3 className="text-xl font-semibold text-(--md-sys-color-on-secondary-container) mb-4">
          Edit Category: {category.name}
        </h3>
        
        {/* Tab Navigation */}
        <SegmentedButton
          options={TAB_OPTIONS}
          value={activeTab}
          onChange={setActiveTab}
          disabled={updateCategory.isPending}
        />
      </div>

      {/* Error Alert */}
      {updateCategory.isError && updateCategory.error && (
        <div className="mx-6 mt-4 p-4 bg-(--md-sys-color-error-container) text-(--md-sys-color-on-error-container) rounded-xl border border-(--md-sys-color-error)">
          <div className="flex items-center gap-3">
            <span className="mdi text-xl">error</span>
            <span className="font-medium">
              {updateCategory.error.message || 'Failed to update category'}
            </span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleUpdateCategory} className="p-6 pt-4">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Form Fields */}
              <div className="space-y-4">
                <TextField
                  label="Category Name"
                  value={editCategory.name}
                  onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                  required
                  disabled={updateCategory.isPending}
                  placeholder="Enter category name"
                />

                <TextArea
                  label="Description"
                  value={editCategory.description}
                  onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })}
                  placeholder="Enter category description (optional)"
                  disabled={updateCategory.isPending}
                  rows={3}
                />
              </div>

              {/* Right Column - Image Upload */}
              <div className="space-y-4">
                {/* <label className="block text-sm font-medium text-(--md-sys-color-on-surface) mb-2">
                  Category Image
                </label> */}
                <ImageUploadZone
                  value={editCategory.imageUrl}
                  label="Upload Category Image"
                  onChange={(url) => setEditCategory({ ...editCategory, imageUrl: url })}
                  disabled={updateCategory.isPending}
                />
              </div>
            </div>
          </div>
        )}

        {/* Advanced Tab - Dynamic Fields */}
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-(--md-sys-color-on-surface) mb-1">
                  Dynamic Fields
                </h4>
                <p className="text-sm text-(--md-sys-color-on-surface-variant)">
                  Define custom fields for products in this category
                </p>
              </div>
              <Button
                type="button"
                variant="filled"
                hasIcon
                icon="add"
                label="Add Field"
                onClick={addDynamicField}
                disabled={updateCategory.isPending}
              />
            </div>

            {editCategory.dynamicFields.length === 0 ? (
              <Card variant="outlined" className="text-center py-8">
                <div className="flex flex-col items-center justify-center">
                  <span className="mdi text-3xl mb-2 text-(--md-sys-color-on-surface-variant)">tune</span>
                  <div className="text-(--md-sys-color-on-surface) font-medium mb-2">
                    No dynamic fields
                  </div>
                  <div className="text-(--md-sys-color-on-surface-variant) text-sm mb-4">
                    Add custom fields to collect additional product information
                  </div>
                  <Button
                    type="button"
                    variant="filled"
                    hasIcon
                    icon="add"
                    label="Add First Field"
                    onClick={addDynamicField}
                    disabled={updateCategory.isPending}
                  />
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {editCategory.dynamicFields.map((field, index) => {
                  const fieldKey = field.tempId || `field_${field.id}_${index}`;
                  return (
                    <Card key={fieldKey} variant="outlined" className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <h5 className="font-medium text-(--md-sys-color-on-surface)">
                          Field {index + 1}
                        </h5>
                        <Button
                          type="button"
                          variant="text"
                          hasIcon
                          icon="delete"
                          hasLabel={false}
                          onClick={() => removeDynamicField(index)}
                          disabled={updateCategory.isPending}
                          className="text-(--md-sys-color-error) hover:bg-(--md-sys-color-error-container)"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextField
                          label="Field Name"
                          value={field.fieldName}
                          onChange={(e) => updateDynamicField(index, { fieldName: e.target.value })}
                          placeholder="e.g., Size, Color, Material"
                          required
                          disabled={updateCategory.isPending}
                        />

                        <Select
                          label="Field Type"
                          value={field.fieldType}
                          onChange={(value) => updateDynamicField(index, { fieldType: value as CategoryDynamicField['fieldType'] })}
                          options={FIELD_TYPE_OPTIONS}
                          disabled={updateCategory.isPending}
                        />

                        <Select
                          label="Applies To"
                          value={field.appliesTo}
                          onChange={(value) => updateDynamicField(index, { appliesTo: value as CategoryDynamicField['appliesTo'] })}
                          options={APPLIES_TO_OPTIONS}
                          disabled={updateCategory.isPending}
                        />

                        <div className="flex items-center pt-6">
                          <Checkbox
                            checked={field.required}
                            onChange={(checked) => updateDynamicField(index, { required: checked })}
                            label="Required Field"
                            disabled={updateCategory.isPending}
                          />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-(--md-sys-color-outline-variant)">
          <Button
            type="button"
            variant="outlined"
            label="Cancel"
            onClick={onCancel}
            disabled={updateCategory.isPending}
            className="sm:order-1"
          />
          <Button
            type="submit"
            variant="filled"
            label={updateCategory.isPending ? "Updating..." : "Update Category"}
            disabled={updateCategory.isPending || !editCategory.name.trim()}
            hasIcon={updateCategory.isPending}
            icon={updateCategory.isPending ? "refresh" : undefined}
            className="sm:order-2"
          />
        </div>
      </form>

      {/* Snackbar for notifications */}
      <Snackbar
        message={snackbar.message}
        isOpen={snackbar.isOpen}
        onClose={hideSnackbar}
        severity={snackbar.severity}
        action={snackbar.action}
      />
    </Card>
  );
}
