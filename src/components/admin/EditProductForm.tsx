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
import { useUpdateProduct } from '@/hooks/useProducts';
import { useSnackbar } from '@/hooks/useSnackbar';
import { Product, UpdateProductRequest, ProductField, ProductDynamicValue, ProductVariation } from '@/types/Product';
import { Category, CategoryDynamicField } from '@/types/Category';
import { productFormSchema } from '@/schemas/product';
import { t } from '@/utils/localization';

// Form data type that matches our expected structure
interface EditProductFormData {
  name: string;
  description: string;
  basePrice: number;
  categoryId: number;
  images: string[];
  dynamicValues?: { fieldId: number; value: string | number | boolean }[];
  variations?: {
    id?: number;
    tempId?: string;
    type: string;
    name: string;
    additionalPrice: number;
    dynamicValues?: { fieldId: number; value: string | number | boolean }[];
  }[];
}

interface EditProductFormProps {
  product: Product;
  onCancel: () => void;
  onProductUpdated: (product: Product) => void;
}

const TAB_OPTIONS = [
  { value: 'basic', label: t('products.basicInfo'), icon: 'info' },
  { value: 'dynamic', label: t('products.dynamicFields'), icon: 'tune' },
  { value: 'variations', label: t('products.variations'), icon: 'palette' },
];

export default function EditProductForm({ product, onCancel, onProductUpdated }: EditProductFormProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control,
  } = useForm<EditProductFormData>({
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
  const { fields: dynamicFields, append: appendDynamic, remove: removeDynamic } = useFieldArray({
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
  
  // Use TanStack Query for categories and product update
  const { data: categories = [] } = useCategories();
  const updateProduct = useUpdateProduct();
  
  // Snackbar for notifications
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  // Initialize form with product data
  useEffect(() => {
    if (product) {
      // Initialize basic form data
      reset({
        name: product.name,
        description: product.description || '',
        basePrice: product.basePrice,
        categoryId: product.categoryId,
        images: product.images || [],
        dynamicValues: [],
        variations: [],
      });

      // Set selected category
      const category = categories.find(cat => cat.id === product.categoryId);
      setSelectedCategory(category || null);

      // Initialize dynamic values
      if (product.dynamicValues && category?.dynamicFields) {
        const formDynamicValues = category.dynamicFields.map(field => {
          const existingValue = product.dynamicValues?.find(dv => dv.field.id === field.id);
          let value: string | number | boolean = getDefaultValue(field);
          
          if (existingValue?.value !== undefined) {
            // Convert Date to string if needed
            if (existingValue.value instanceof Date) {
              value = existingValue.value.toISOString();
            } else {
              value = existingValue.value as string | number | boolean;
            }
          }
          
          return {
            fieldId: field.id,
            value: value
          };
        });
        setValue('dynamicValues', formDynamicValues);
      }

      // Initialize variations
      if (product.variations) {
        const formVariations = product.variations.map(variation => {
          const variationDynamicValues = category?.dynamicFields
            ?.filter(field => field.appliesTo === 'VARIATION')
            .map(field => {
              const existingValue = variation.dynamicValues?.find(dv => dv.field.id === field.id);
              let value: string | number | boolean = getDefaultValue(field);
              
              if (existingValue?.value !== undefined) {
                // Convert Date to string if needed
                if (existingValue.value instanceof Date) {
                  value = existingValue.value.toISOString();
                } else {
                  value = existingValue.value as string | number | boolean;
                }
              }
              
              return {
                fieldId: field.id,
                value: value
              };
            }) || [];

          return {
            id: variation.id,
            tempId: `existing_${variation.id}`,
            type: variation.type || '',
            name: variation.name,
            additionalPrice: variation.additionalPrice,
            dynamicValues: variationDynamicValues
          };
        });
        setValue('variations', formVariations);
      }
    }
  }, [product, categories, reset, setValue]);

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
        category.dynamicFields
          .filter(field => field.appliesTo === 'PRODUCT')
          .forEach((field) => {
            appendDynamic({
              fieldId: field.id,
              value: getDefaultValue(field)
            });
          });
      }
      
      // Reset variations when category changes (preserve existing data if same category)
      if (category?.id !== product.categoryId) {
        variationFields.forEach((_, index) => removeVariation(index));
      }
    }
  }, [watchedCategoryId, categories, appendDynamic, removeDynamic, removeVariation, dynamicFields, variationFields, product.categoryId]);

  // Helper function to get default value for dynamic fields
  const getDefaultValue = (field: CategoryDynamicField): string | number | boolean => {
    switch (field.fieldType) {
      case 'TEXT':
        return '';
      case 'NUMBER':
        return 0;
      case 'BOOLEAN':
        return false;
      case 'DATE':
        return new Date().toISOString(); // Convert date to string
      default:
        return '';
    }
  };

  // Form submission handler
  const onSubmit: SubmitHandler<EditProductFormData> = async (data) => {
    try {
      const updateRequest: UpdateProductRequest = {
        id: product.id,
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        categoryId: data.categoryId,
        images: data.images,
        dynamicValues: data.dynamicValues?.map(dv => {
          const field = selectedCategory?.dynamicFields?.find(f => f.id === dv.fieldId);
          if (!field) return null;
          
          // Find existing dynamic value to preserve id
          const existingDynamicValue = product.dynamicValues?.find(edv => edv.field.id === field.id);
          
          return {
            id: existingDynamicValue?.id || 0, // Use existing id or 0 for new
            productId: product.id,
            field: {
              id: field.id,
              fieldName: field.fieldName,
              fieldType: field.fieldType,
              appliesTo: field.appliesTo,
              required: field.required
            } as ProductField,
            value: dv.value
          } as ProductDynamicValue;
        }).filter(Boolean) as ProductDynamicValue[],
        variations: data.variations?.map(v => {
          const variationDynamicValues = v.dynamicValues?.map(dv => {
            const field = selectedCategory?.dynamicFields?.find(f => f.id === dv.fieldId);
            if (!field) return null;
            
            // Find existing variation and its dynamic values
            const existingVariation = product.variations?.find(ev => ev.id === v.id);
            const existingDynamicValue = existingVariation?.dynamicValues?.find(edv => edv.field.id === field.id);
            
            return {
              id: existingDynamicValue?.id || 0, // Use existing id or 0 for new
              variationId: v.id,
              field: {
                id: field.id,
                fieldName: field.fieldName,
                fieldType: field.fieldType,
                appliesTo: field.appliesTo,
                required: field.required
              } as ProductField,
              value: dv.value
            } as ProductDynamicValue;
          }).filter(Boolean) as ProductDynamicValue[];
          
          return {
            id: v.id || 0, // Use existing id or 0 for new variations
            productId: product.id,
            type: v.type,
            name: v.name,
            additionalPrice: v.additionalPrice,
            dynamicValues: variationDynamicValues
          } as ProductVariation;
        }) as ProductVariation[]
      };

      const result = await updateProduct.mutateAsync({ id: product.id, data: updateRequest });
      showSnackbar(t('products.updateSuccess'), 'success');
      onProductUpdated(result);
    } catch (error) {
      console.error('Error updating product:', error);
      showSnackbar(t('products.updateError'), 'error');
    }
  };

  // Handle adding variations
  const handleAddVariation = () => {
    appendVariation({
      tempId: `temp_${Date.now()}`,
      type: '',
      name: '',
      additionalPrice: 0,
      dynamicValues: selectedCategory?.dynamicFields
        ?.filter(field => field.appliesTo === 'VARIATION')
        .map(field => ({
          fieldId: field.id,
          value: getDefaultValue(field)
        })) || []
    });
  };

  // Handle updating dynamic field values
  const updateDynamicValue = (fieldIndex: number, value: string | number | boolean) => {
    const currentDynamicValues = watch('dynamicValues') || [];
    const newDynamicValues = [...currentDynamicValues];
    newDynamicValues[fieldIndex] = {
      fieldId: dynamicFields[fieldIndex].fieldId,
      value
    };
    setValue('dynamicValues', newDynamicValues);
  };

  // Helper function to get error message from form errors
  const getErrorMessage = (error: unknown): string | undefined => {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }
    return undefined;
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
        <h2 className="text-xl font-semibold text-(--md-sys-color-on-surface)">{t('products.editProduct')}: {product.name}</h2>
      </div>

      <div className="px-6 mt-4">
        <SegmentedButton
          options={TAB_OPTIONS}
          value={activeTab}
          onChange={setActiveTab}
          // className="p-4 pb-0"
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
                value={String(watchedCategoryId)}
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
              <div className="space-y-4">
                {/* Existing Images */}
                {watchedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <ImageUploadZone
                      value={image}
                      onChange={(newImageUrl) => {
                        const currentImages = [...watchedImages];
                        currentImages[index] = newImageUrl;
                        setValue('images', currentImages);
                      }}
                      label={`${t('products.image')} ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="text"
                      onClick={() => {
                        const currentImages = watchedImages.filter((_, i) => i !== index);
                        setValue('images', currentImages);
                      }}
                      className="mt-2"
                    >
                      {t('common.delete')} {t('products.image')} {index + 1}
                    </Button>
                  </div>
                ))}
                
                {/* Add New Image */}
                <div className="border-2 border-dashed border-(--md-sys-color-outline-variant) rounded-lg p-4">
                  <ImageUploadZone
                    value=""
                    onChange={(newImageUrl) => {
                      if (newImageUrl) {
                        setValue('images', [...watchedImages, newImageUrl]);
                      }
                    }}
                    label={t('products.addNewImage')}
                  />
                </div>
                
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
              <h3 className="text-lg font-medium text-(--md-sys-color-on-surface)">{t('products.variations')}</h3>
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
                      <h4 className="font-medium text-(--md-sys-coloron-surface)">{t('products.variation')} {variationIndex + 1}</h4>
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
                        <h5 className="font-medium text-(--md-sys-color-on-surface-variant) mb-3">{t('products.detailInfo')}</h5>
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
            disabled={updateProduct.isPending}
          >
            {updateProduct.isPending ? t('products.updating') : t('products.updateProduct')}
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
