'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { categoryFormSchema, type CategoryFormData } from '@/schemas/category';
import { t } from '@/utils/localization';

interface AddCategoryFormProps {
  onCancel: () => void;
  onCategoryAdded: (category: Category) => void;
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
  const [imageUrl, setImageUrl] = useState('');
  const [dynamicFields, setDynamicFields] = useState<(Omit<CategoryDynamicField, 'id'> & { tempId: string })[]>([]);
  
  // React Hook Form setup
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
      parentCategoryId: null
    }
  });

  // Watch form values for real-time updates
  const watchedName = watch('name');
  
  // Use TanStack Query mutation for creating categories
  const createCategory = useCreateCategory();
  
  // Snackbar for notifications
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  const handleAddCategory = async (data: CategoryFormData) => {
    try {
      // Create the category data to send to the API
      const categoryData: CreateCategoryRequest = {
        name: data.name.trim(),
        description: data.description || undefined,
        imageUrl: imageUrl.trim() || undefined,
        dynamicFields: dynamicFields.length > 0 ? dynamicFields : undefined
      };

      const addedCategory = await createCategory.mutateAsync(categoryData);
      onCategoryAdded(addedCategory);
      reset();
      setImageUrl('');
      setDynamicFields([]);
      showSnackbar(`Category "${addedCategory.name}" created successfully!`, 'success');
    } catch (error) {
      console.error('Error adding category:', error);
      // Error handling is managed by TanStack Query
    }
  };

  const handleFormSubmit = handleSubmit(handleAddCategory);

  const addDynamicField = () => {
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    setDynamicFields([
      ...dynamicFields,
      {
        tempId,
        fieldName: '',
        fieldType: 'TEXT',
        appliesTo: 'PRODUCT',
        required: false
      }
    ]);
  };

  const removeDynamicField = (index: number) => {
    setDynamicFields(dynamicFields.filter((_, i) => i !== index));
  };

  const updateDynamicField = (index: number, field: Partial<Omit<CategoryDynamicField, 'id'>>) => {
    const updatedFields = [...dynamicFields];
    updatedFields[index] = { ...updatedFields[index], ...field };
    setDynamicFields(updatedFields);
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
      
      <form onSubmit={handleFormSubmit} className="p-6 pt-4">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Form Fields */}
              <div className="space-y-4">
                <TextField
                  label={t('categories.categoryName')}
                  {...register('name')}
                  error={errors.name?.message}
                  required
                  disabled={createCategory.isPending}
                  placeholder={t('categories.categoryNamePlaceholder')}
                />
                
                <TextArea
                  label={t('categories.description')}
                  {...register('description')}
                  error={errors.description?.message}
                  rows={4}
                  disabled={createCategory.isPending}
                  placeholder={t('categories.categoryDescriptionPlaceholder')}
                />
              </div>

              {/* Right Column - Image Upload */}
              <div>
                <ImageUploadZone
                  value={imageUrl}
                  label={t('categories.categoryImage')}
                  onChange={setImageUrl}
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
                label={t('categories.addField')}
                onClick={addDynamicField}
                disabled={createCategory.isPending}
              />
            </div>

            {dynamicFields.length === 0 ? (
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
                  label={t('categories.addFirstField')}
                  onClick={addDynamicField}
                  disabled={createCategory.isPending}
                />
              </Card>
            ) : (
              <div className="space-y-4">
                {dynamicFields.map((field, index) => {
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
                        label={t('categories.fieldName')}
                        value={field.fieldName}
                        onChange={(e) => updateDynamicField(index, { fieldName: e.target.value })}
                        placeholder={t('categories.dynamicFieldPlaceholder')}
                        disabled={createCategory.isPending}
                        required
                      />
                      
                      <Select
                        label={t('categories.fieldType')}
                        value={field.fieldType}
                        onChange={(value) => updateDynamicField(index, { 
                          fieldType: value as CategoryDynamicField['fieldType'] 
                        })}
                        options={FIELD_TYPE_OPTIONS}
                        disabled={createCategory.isPending}
                      />

                      <Select
                        label={t('categories.appliesTo')}
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
                          label={t('categories.requiredField')}
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
            disabled={createCategory.isPending || !watchedName?.trim()}
            hasIcon
            icon={createCategory.isPending ? undefined : "add"}
            className="flex-1 sm:flex-none"
          />
          <Button
            type="button"
            variant="outlined"
            label={t('actions.cancel')}
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
