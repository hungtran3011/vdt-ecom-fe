'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
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
import { useCategories } from '@/hooks/useCategories';
import { useCreateProduct } from '@/hooks/useProducts';
import { useSnackbar } from '@/hooks/useSnackbar';
import { Product, CreateProductRequest, ProductField, ProductDynamicValue } from '@/types/Product';
import { Category, CategoryDynamicField } from '@/types/Category';
import { productFormSchema } from '@/schemas/product';
import { t } from '@/utils/localization';

// Form data type that matches our expected structure
interface ProductFormData {
  name: string;
  description: string;
  basePrice: number;
  categoryId: number;
  images: string[];
  dynamicValues?: { fieldId: number; value: string | number | boolean }[];
  variations?: {
    tempId?: string;
    type: string;
    name: string;
    additionalPrice: number;
    dynamicValues?: { fieldId: number; value: string | number | boolean }[];
  }[];
}

interface AddProductFormProps {
  onCancel: () => void;
  onProductAdded: (product: Product) => void;
}

const TAB_OPTIONS = [
  { value: 'basic', label: t('products.basicInfo'), icon: 'info' },
  { value: 'dynamic', label: t('products.dynamicFields'), icon: 'tune' },
  { value: 'variations', label: t('products.variations'), icon: 'palette' },
];

export default function AddProductForm({ onCancel, onProductAdded }: AddProductFormProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Helper function to safely extract error messages
  const getErrorMessage = (error: unknown): string | undefined => {
    if (error && typeof error === 'object' && 'message' in error) {
      return (error as { message: string }).message;
    }
    return undefined;
  };

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      basePrice: 0,
      categoryId: 0,
      images: [],
      dynamicValues: [],
      variations: [],
    }
  });

  // Field arrays for dynamic data
  const { fields: dynamicFields, append: appendDynamic, remove: removeDynamic, update: updateDynamic } = useFieldArray({
    control,
    name: 'dynamicValues'
  });

  const { fields: variationFields, append: appendVariation, remove: removeVariation } = useFieldArray({
    control,
    name: 'variations'
  });

  // Watch form values
  const watchedCategoryId = watch('categoryId');
  const watchedImages = watch('images') || [];
  
  // Use TanStack Query for categories and product creation
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  
  // Snackbar for notifications
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  // Update selected category when categoryId changes
  useEffect(() => {
    if (watchedCategoryId) {
      const category = categories.find(cat => cat.id === watchedCategoryId);
      setSelectedCategory(category || null);
      
      // Reset dynamic values when category changes
      // Clear existing dynamic values
      dynamicFields.forEach((_, index) => removeDynamic(index));
      
      // Initialize dynamic values for new category
      if (category?.dynamicFields) {
        category.dynamicFields.forEach((field) => {
          appendDynamic({
            fieldId: field.id,
            value: getDefaultValue(field)
          });
        });
      }
      
      // Reset variations when category changes
      variationFields.forEach((_, index) => removeVariation(index));
    }
  }, [watchedCategoryId, categories, appendDynamic, removeDynamic, removeVariation, dynamicFields, variationFields]);

  // Helper function to get default value for dynamic fields
  const getDefaultValue = (field: CategoryDynamicField): string | number | boolean => {
    switch (field.fieldType) {
      case 'TEXT':
        return '';
      case 'NUMBER':
        return 0;
      case 'BOOLEAN':
        return false;
      default:
        return '';
    }
  };

  // Form submission handler
  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    try {
      const createRequest: CreateProductRequest = {
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        categoryId: data.categoryId,
        images: data.images,
        dynamicValues: data.dynamicValues?.map(dv => {
          const field = selectedCategory?.dynamicFields?.find(f => f.id === dv.fieldId);
          if (!field) return null;
          return {
            field: {
              id: field.id,
              fieldName: field.fieldName,
              fieldType: field.fieldType,
              appliesTo: field.appliesTo,
              required: field.required
            } as ProductField,
            value: dv.value
          };
        }).filter(Boolean) as Omit<ProductDynamicValue, 'id' | 'productId'>[],
        variations: data.variations?.map(v => {
          const variationDynamicValues = v.dynamicValues?.map(dv => {
            const field = selectedCategory?.dynamicFields?.find(f => f.id === dv.fieldId);
            if (!field) return null;
            return {
              field: {
                id: field.id,
                fieldName: field.fieldName,
                fieldType: field.fieldType,
                appliesTo: field.appliesTo,
                required: field.required
              } as ProductField,
              value: dv.value
            };
          }).filter(Boolean) as Omit<ProductDynamicValue, 'id' | 'productId'>[];
          
          return {
            type: v.type,
            name: v.name,
            additionalPrice: v.additionalPrice,
            dynamicValues: variationDynamicValues
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any
      };

      const result = await createProduct.mutateAsync(createRequest);
      showSnackbar(t('products.createSuccess'), 'success');
      onProductAdded(result);
      reset();
    } catch (error) {
      console.error('Error creating product:', error);
      showSnackbar(t('products.createError'), 'error');
    }
  };

  // Handle single image upload from ImageUploadZone
  const handleImageUpload = (url: string) => {
    if (url) {
      setValue('images', [...watchedImages, url]);
    }
  };

  // Handle removing images
  const handleRemoveImage = (index: number) => {
    const currentImages = watchedImages;
    const newImages = currentImages.filter((_, i) => i !== index);
    setValue('images', newImages);
  };

  // Handle adding variations
  const handleAddVariation = () => {
    appendVariation({
      tempId: `temp_${Date.now()}`,
      type: '',
      name: '',
      additionalPrice: 0,
      dynamicValues: selectedCategory?.dynamicFields?.map(field => ({
        fieldId: field.id,
        value: getDefaultValue(field)
      })) || []
    });
  };

  // Handle updating dynamic field values
  const updateDynamicValue = (fieldIndex: number, value: string | number | boolean) => {
    updateDynamic(fieldIndex, {
      fieldId: dynamicFields[fieldIndex].fieldId,
      value
    });
  };

  // Render dynamic field input based on type
  const renderDynamicField = (field: CategoryDynamicField, fieldIndex: number, isVariation: boolean = false, variationIndex?: number) => {
    const currentValue = isVariation 
      ? watch(`variations.${variationIndex!}.dynamicValues.${fieldIndex}.value`)
      : watch(`dynamicValues.${fieldIndex}.value`);

    const updateValue = (value: string | number | boolean) => {
      if (isVariation && variationIndex !== undefined) {
        const currentVariation = watch(`variations.${variationIndex}`);
        const newDynamicValues = [...(currentVariation.dynamicValues || [])];
        newDynamicValues[fieldIndex] = { fieldId: field.id, value };
        setValue(`variations.${variationIndex}.dynamicValues`, newDynamicValues);
      } else {
        updateDynamicValue(fieldIndex, value);
      }
    };

    switch (field.fieldType) {
      case 'TEXT':
        return (
          <TextField
            key={field.id}
            label={field.fieldName}
            value={String(currentValue || '')}
            onChange={(e) => updateValue(e.target.value)}
            required={field.required}
          />
        );

      case 'NUMBER':
        return (
          <TextField
            key={field.id}
            label={field.fieldName}
            type="number"
            value={String(currentValue || 0)}
            onChange={(e) => updateValue(Number(e.target.value))}
            required={field.required}
          />
        );

      case 'BOOLEAN':
        return (
          <Checkbox
            key={field.id}
            label={field.fieldName}
            checked={Boolean(currentValue)}
            onChange={(checked) => updateValue(checked)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <div className="p-6 border-b border-(--md-sys-color-outline-variant)">
        <h2 className="text-xl font-semibold text-(--md-sys-color-on-surface)">{t('products.addNew')}</h2>
      </div>

      <div className="px-6 mt-4">
        <SegmentedButton
          options={TAB_OPTIONS}
          value={activeTab}
          onChange={setActiveTab}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-4 overflow-visible relative">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <TextField
              label={t('products.name')}
              {...register('name')}
              error={errors.name?.message}
              required
            />

            <TextArea
              label={t('products.description')}
              {...register('description')}
              error={errors.description?.message}
              rows={4}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label={t('products.basePrice')}
                type="number"
                {...register('basePrice', { valueAsNumber: true })}
                error={errors.basePrice?.message}
                required
              />

              <Select
                label={t('products.category')}
                value={String(watchedCategoryId || '')}
                onChange={(value) => setValue('categoryId', parseInt(value))}
                options={categories.map(cat => ({
                  label: cat.name,
                  value: String(cat.id)
                }))}
                required
                placeholder={t('products.selectCategory')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-(--md-sys-color-on-surface) mb-2">
                {t('products.images')}
              </label>
              <div className="space-y-4">
                {/* Show existing images */}
                {watchedImages.map((image, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-on-surface">
                        {t('products.image')} {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="text"
                        onClick={() => handleRemoveImage(index)}
                      >
                        {t('common.delete')}
                      </Button>
                    </div>
                    <ImageUploadZone
                      value={image}
                      onChange={(url) => {
                        const newImages = [...watchedImages];
                        newImages[index] = url;
                        setValue('images', newImages);
                      }}
                      label={`${t('products.image')} ${index + 1}`}
                    />
                  </div>
                ))}
                
                {/* Add new image button */}
                {watchedImages.length < 5 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-on-surface">
                      {t('products.addNewImage')}
                    </span>
                    <ImageUploadZone
                      value=""
                      onChange={handleImageUpload}
                      label={t('products.addNewImage')}
                    />
                  </div>
                )}
                
                {errors.images && (
                  <p className="text-sm text-(--md-sys-color-error)">{errors.images.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Fields Tab */}
        {activeTab === 'dynamic' && (
          <div className="space-y-4">
            {selectedCategory?.dynamicFields && selectedCategory.dynamicFields.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-(--md-sys-color-on-surface)">
                  {t('products.detailsFor')} {selectedCategory.name}
                </h3>
                {selectedCategory.dynamicFields
                  .filter(field => field.appliesTo === 'PRODUCT')
                  .map((field, fieldIndex) => 
                    renderDynamicField(field, fieldIndex)
                  )}
              </div>
            ) : (
              <div className="text-center py-8 text-(--md-sys-color-on-surface-variant)">
                {selectedCategory ? 
                  t('products.noDynamicFields') : 
                  t('products.selectCategoryFirst')
                }
              </div>
            )}
          </div>
        )}

        {/* Variations Tab */}
        {activeTab === 'variations' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-on-surface">{t('products.variations')}</h3>
              <Button
                type="button"
                variant="outlined"
                onClick={handleAddVariation}
                disabled={!selectedCategory}
              >
                {t('products.addVariation')}
              </Button>
            </div>

            {variationFields.length > 0 ? (
              <div className="space-y-6">
                {variationFields.map((variation, variationIndex) => (
                  <Card key={variation.id} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-on-surface">{t('products.variation')} {variationIndex + 1}</h4>
                      <Button
                        type="button"
                        variant="text"
                        onClick={() => removeVariation(variationIndex)}
                      >
                        {t('common.delete')}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <TextField
                        label={t('products.variationType')}
                        {...register(`variations.${variationIndex}.type`)}
                        error={getErrorMessage(errors.variations?.[variationIndex]?.type)}
                        required
                      />
                      <TextField
                        label={t('products.variationName')}
                        {...register(`variations.${variationIndex}.name`)}
                        error={getErrorMessage(errors.variations?.[variationIndex]?.name)}
                        required
                      />
                      <TextField
                        label={t('products.additionalPrice')}
                        type="number"
                        {...register(`variations.${variationIndex}.additionalPrice`, { valueAsNumber: true })}
                        error={getErrorMessage(errors.variations?.[variationIndex]?.additionalPrice)}
                      />
                    </div>

                    {selectedCategory?.dynamicFields && selectedCategory.dynamicFields.filter(field => field.appliesTo === 'VARIATION').length > 0 && (
                      <div>
                        <h5 className="font-medium text-on-surface mb-3">{t('products.detailInfo')}</h5>
                        <div className="space-y-3">
                          {selectedCategory.dynamicFields
                            .filter(field => field.appliesTo === 'VARIATION')
                            .map((field, fieldIndex) => 
                              renderDynamicField(field, fieldIndex, true, variationIndex)
                            )}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-(--md-sys-color-on-surface-variant)">
                {t('products.noVariations')}
              </div>
            )}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-(--md-sys-color-outline-variant)">
          <Button
            type="button"
            variant="outlined"
            onClick={onCancel}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="filled"
            disabled={createProduct.isPending}
          >
            {createProduct.isPending ? t('products.creating') : t('products.addNew')}
          </Button>
        </div>
      </form>

      {/* Snackbar */}
      {snackbar.isOpen && (
        <Snackbar
          isOpen={snackbar.isOpen}
          message={snackbar.message}
          onClose={hideSnackbar}
        />
      )}
    </Card>
  );
}
