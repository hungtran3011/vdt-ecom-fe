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
import { Category, CategoryDynamicField, CreateCategoryRequest } from '@/types/Category';
import { useCreateCategory } from '@/hooks/useCategories';
import { useSnackbar } from '@/hooks/useSnackbar';

interface AddCategoryFormProps {
  onCancel: () => void;
  onCategoryAdded: (category: Category) => void;
}

interface NewCategoryForm {
  name: string;
  description: string;
  imageUrl: string;
  dynamicFields: (Omit<CategoryDynamicField, 'id'> & { tempId: string })[];
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

export default function AddCategoryForm({ onCancel, onCategoryAdded }: AddCategoryFormProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [newCategory, setNewCategory] = useState<NewCategoryForm>({ 
    name: '', 
    description: '', 
    imageUrl: '',
    dynamicFields: []
  });
  
  // Use TanStack Query mutation for creating categories
  const createCategory = useCreateCategory();
  
  // Snackbar for notifications
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    try {
      // Create the category data to send to the API
      const categoryData: CreateCategoryRequest = {
        name: newCategory.name.trim(),
        description: newCategory.description.trim() || undefined,
        imageUrl: newCategory.imageUrl.trim() || undefined,
        dynamicFields: newCategory.dynamicFields.length > 0 ? newCategory.dynamicFields : undefined
      };

      const addedCategory = await createCategory.mutateAsync(categoryData);
      onCategoryAdded(addedCategory);
      setNewCategory({ name: '', description: '', imageUrl: '', dynamicFields: [] });
      showSnackbar(`Category "${addedCategory.name}" created successfully!`, 'success');
    } catch (error) {
      console.error('Error adding category:', error);
      // Error handling is managed by TanStack Query
    }
  };

  const addDynamicField = () => {
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    setNewCategory({
      ...newCategory,
      dynamicFields: [
        ...newCategory.dynamicFields,
        {
          tempId,
          fieldName: '',
          fieldType: 'TEXT',
          appliesTo: 'PRODUCT',
          required: false
        }
      ]
    });
  };

  const removeDynamicField = (index: number) => {
    setNewCategory({
      ...newCategory,
      dynamicFields: newCategory.dynamicFields.filter((_, i) => i !== index)
    });
  };

  const updateDynamicField = (index: number, field: Partial<Omit<CategoryDynamicField, 'id'>>) => {
    const updatedFields = [...newCategory.dynamicFields];
    updatedFields[index] = { ...updatedFields[index], ...field };
    setNewCategory({
      ...newCategory,
      dynamicFields: updatedFields
    });
  };

  return (
    <Card variant="elevated" className="mb-6 overflow-visible">
      {/* Header */}
      <div className="bg-(--md-sys-color-primary-container) p-6 pb-4">
        <h3 className="text-xl font-semibold text-(--md-sys-color-on-primary-container) mb-4">
          Add New Category
        </h3>
        
        {/* Tab Navigation */}
        <SegmentedButton
          options={TAB_OPTIONS}
          value={activeTab}
          onChange={setActiveTab}
          disabled={createCategory.isPending}
        />
      </div>

      {/* Error Alert */}
      {createCategory.isError && createCategory.error && (
        <div className="mx-6 mt-4 p-4 bg-(--md-sys-color-error-container) text-(--md-sys-color-on-error-container) rounded-xl border border-(--md-sys-color-error)">
          <div className="flex items-center gap-3">
            <span className="mdi text-xl">error</span>
            <span className="font-medium">
              {createCategory.error.message || 'Failed to add category'}
            </span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleAddCategory} className="p-6 pt-4">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Form Fields */}
              <div className="space-y-4">
                <TextField
                  label="Category Name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  required
                  disabled={createCategory.isPending}
                  placeholder="Enter category name"
                />
                
                <TextArea
                  label="Description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  rows={4}
                  disabled={createCategory.isPending}
                  placeholder="Describe this category..."
                />
              </div>

              {/* Right Column - Image Upload */}
              <div>
                <ImageUploadZone
                  value={newCategory.imageUrl}
                  label="Category Image"
                  onChange={(imageUrl) => setNewCategory({ ...newCategory, imageUrl })}
                  disabled={createCategory.isPending}
                />
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Fields Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-(--md-sys-color-on-surface) mb-1">
                  Dynamic Fields
                </h4>
                <p className="text-sm text-(--md-sys-color-on-surface-variant)">
                  Add custom properties that products in this category can have
                </p>
              </div>
              <Button
                type="button"
                variant="filled"
                hasIcon
                icon="add"
                label="Add Field"
                onClick={addDynamicField}
                disabled={createCategory.isPending}
              />
            </div>

            {newCategory.dynamicFields.length === 0 ? (
              <Card variant="outlined" className="text-center py-12">
                <span className="mdi text-5xl mb-4 text-(--md-sys-color-on-surface-variant) block">
                  tune
                </span>
                <h5 className="text-lg font-medium text-(--md-sys-color-on-surface) mb-2">
                  No dynamic fields yet
                </h5>
                <p className="text-sm text-(--md-sys-color-on-surface-variant) mb-4">
                  Dynamic fields allow you to add custom properties like size, color, or weight to products in this category.
                </p>
                <Button
                  type="button"
                  variant="filled"
                  hasIcon
                  icon="add"
                  label="Add Your First Field"
                  onClick={addDynamicField}
                  disabled={createCategory.isPending}
                />
              </Card>
            ) : (
              <div className="space-y-4">
                {newCategory.dynamicFields.map((field, index) => {
                  const fieldKey = field.tempId || `field_${index}`;
                  return (
                    <Card key={fieldKey} variant="outlined" className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="mdi text-lg text-(--md-sys-color-primary)">
                          tune
                        </span>
                        <span className="font-medium text-(--md-sys-color-on-surface)">
                          Field {index + 1}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="text"
                        hasIcon
                        icon="delete"
                        onClick={() => removeDynamicField(index)}
                        disabled={createCategory.isPending}
                        className="text-(--md-sys-color-error) hover:bg-(--md-sys-color-error-container)"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                      <TextField
                        label="Field Name"
                        value={field.fieldName}
                        onChange={(e) => updateDynamicField(index, { fieldName: e.target.value })}
                        placeholder="e.g., Size, Color, Weight"
                        disabled={createCategory.isPending}
                        required
                      />
                      
                      <Select
                        label="Field Type"
                        value={field.fieldType}
                        onChange={(value) => updateDynamicField(index, { 
                          fieldType: value as CategoryDynamicField['fieldType'] 
                        })}
                        options={FIELD_TYPE_OPTIONS}
                        disabled={createCategory.isPending}
                      />

                      <Select
                        label="Applies To"
                        value={field.appliesTo}
                        onChange={(value) => updateDynamicField(index, { 
                          appliesTo: value as CategoryDynamicField['appliesTo'] 
                        })}
                        options={APPLIES_TO_OPTIONS}
                        disabled={createCategory.isPending}
                      />

                      <div className="flex items-end pb-2">
                        <Checkbox
                          checked={field.required}
                          onChange={(checked) => updateDynamicField(index, { required: checked })}
                          label="Required field"
                          disabled={createCategory.isPending}
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
        <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-(--md-sys-color-outline-variant)">
          <Button
            type="submit"
            variant="filled"
            label={createCategory.isPending ? 'Creating...' : 'Create Category'}
            disabled={createCategory.isPending || !newCategory.name.trim()}
            hasIcon
            icon={createCategory.isPending ? undefined : "add"}
            className="flex-1 sm:flex-none"
          />
          <Button
            type="button"
            variant="outlined"
            label="Cancel"
            onClick={onCancel}
            disabled={createCategory.isPending}
            className="flex-1 sm:flex-none"
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
