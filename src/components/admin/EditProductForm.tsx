'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import TextArea from '@/components/TextArea';
import Select from '@/components/Select';
import Checkbox from '@/components/Checkbox';
import SegmentedButton from '@/components/SegmentedButton';
import Snackbar from '@/components/Snackbar';
import { useCategories } from '@/hooks/useCategories';
import { useUpdateProduct } from '@/hooks/useProducts';
import { useSnackbar } from '@/hooks/useSnackbar';
import { 
  UpdateProductRequest, 
  Product
} from '@/types/Product';
import { Category, CategoryDynamicField } from '@/types/Category';

interface EditProductFormProps {
  product: Product;
  onCancel: () => void;
  onProductUpdated: (product: Product) => void;
}

interface EditProductForm {
  name: string;
  description: string;
  basePrice: string;
  categoryId: string;
  images: string[];
  dynamicValues: { [fieldId: number]: string | number | boolean | Date };
  variations: {
    id?: number;
    tempId: string;
    type: string;
    name: string;
    additionalPrice: string;
    dynamicValues: { [fieldId: number]: string | number | boolean | Date };
  }[];
}

const TAB_OPTIONS = [
  { value: 'basic', label: 'Basic Info', icon: 'info' },
  { value: 'dynamic', label: 'Dynamic Fields', icon: 'tune' },
  { value: 'variations', label: 'Variations', icon: 'palette' },
];

export default function EditProductForm({ product, onCancel, onProductUpdated }: EditProductFormProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [editedProduct, setEditedProduct] = useState<EditProductForm>({
    name: '',
    description: '',
    basePrice: '',
    categoryId: '',
    images: [],
    dynamicValues: {},
    variations: []
  });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [imageInput, setImageInput] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Use TanStack Query for categories and product update
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const updateProduct = useUpdateProduct();
  
  // Snackbar for notifications
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  // Initialize form data from product
  useEffect(() => {
    if (product) {
      // Initialize dynamic values
      const dynamicValues: { [fieldId: number]: string | number | boolean | Date } = {};
      product.dynamicValues?.forEach(dv => {
        dynamicValues[dv.field.id] = dv.value;
      });

      // Initialize variations with proper structure
      const variations = product.variations?.map((variation) => {
        const variationDynamicValues: { [fieldId: number]: string | number | boolean | Date } = {};
        variation.dynamicValues?.forEach(dv => {
          variationDynamicValues[dv.field.id] = dv.value;
        });

        return {
          id: variation.id,
          tempId: `existing_${variation.id}`,
          type: variation.type || 'Color', // Default type if not available
          name: variation.name,
          additionalPrice: variation.additionalPrice.toString(),
          dynamicValues: variationDynamicValues
        };
      }) || [];

      setEditedProduct({
        name: product.name,
        description: product.description || '',
        basePrice: product.basePrice.toString(),
        categoryId: product.categoryId ? product.categoryId.toString() : '',
        images: product.images || [],
        dynamicValues,
        variations
      });
    }
  }, [product]);

  // Update selected category when categoryId changes
  useEffect(() => {
    if (editedProduct.categoryId) {
      const category = categories.find(cat => cat.id === parseInt(editedProduct.categoryId));
      setSelectedCategory(category || null);
    }
  }, [editedProduct.categoryId, categories]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Basic validation
    if (!editedProduct.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!editedProduct.basePrice || parseFloat(editedProduct.basePrice) < 0) {
      newErrors.basePrice = 'Valid base price is required';
    }

    if (!editedProduct.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    // Dynamic fields validation
    if (selectedCategory?.dynamicFields) {
      selectedCategory.dynamicFields
        .filter(field => field.appliesTo === 'PRODUCT' && field.required)
        .forEach(field => {
          if (!editedProduct.dynamicValues[field.id] && editedProduct.dynamicValues[field.id] !== false) {
            newErrors[`dynamic_${field.id}`] = `${field.fieldName} is required`;
          }
        });
    }

    // Variations validation
    editedProduct.variations.forEach((variation, index) => {
      if (!variation.name.trim()) {
        newErrors[`variation_${index}_name`] = 'Variation name is required';
      }
      if (!variation.additionalPrice || parseFloat(variation.additionalPrice) < 0) {
        newErrors[`variation_${index}_additionalPrice`] = 'Valid additional price is required';
      }

      // Dynamic fields validation for variations
      if (selectedCategory?.dynamicFields) {
        selectedCategory.dynamicFields
          .filter(field => field.appliesTo === 'VARIATION' && field.required)
          .forEach(field => {
            if (!variation.dynamicValues[field.id] && variation.dynamicValues[field.id] !== false) {
              newErrors[`variation_${index}_dynamic_${field.id}`] = `${field.fieldName} is required`;
            }
          });
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Prepare dynamic values
      const dynamicValues: object[] = [];
      Object.entries(editedProduct.dynamicValues).forEach(([fieldId, value]) => {
        const field = selectedCategory?.dynamicFields?.find(f => f.id === parseInt(fieldId));
        if (field && value !== undefined && value !== '') {
          dynamicValues.push({
            id: 0, // Will be set by backend
            field: field,
            value: value
          });
        }
      });

      // Prepare variations - handle both existing and new variations
      const variations: object[] = editedProduct.variations.map(variation => {
        const variationDynamicValues: object[] = [];
        Object.entries(variation.dynamicValues).forEach(([fieldId, value]) => {
          const field = selectedCategory?.dynamicFields?.find(f => f.id === parseInt(fieldId));
          if (field && value !== undefined && value !== '') {
            variationDynamicValues.push({
              id: 0, // Will be set by backend
              field: field,
              value: value
            });
          }
        });

        // Determine if this is an existing variation or new one
        const isExisting = variation.tempId.startsWith('existing_');
        const variationId = isExisting ? parseInt(variation.tempId.replace('existing_', '')) : undefined;

        return {
          ...(variationId && { id: variationId }),
          type: variation.type,
          name: variation.name,
          additionalPrice: parseFloat(variation.additionalPrice),
          dynamicValues: variationDynamicValues.length > 0 ? variationDynamicValues : undefined
        };
      });

      // Create the product data to send to the API
      const productData: UpdateProductRequest = {
        name: editedProduct.name.trim(),
        description: editedProduct.description.trim() || undefined,
        basePrice: parseFloat(editedProduct.basePrice),
        categoryId: parseInt(editedProduct.categoryId),
        images: editedProduct.images.length > 0 ? editedProduct.images : undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dynamicValues: dynamicValues.length > 0 ? dynamicValues as any : undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        variations: variations.length > 0 ? variations as any : undefined
      };

      const updatedProduct = await updateProduct.mutateAsync({ id: product.id, data: productData });
      onProductUpdated(updatedProduct);
      
      showSnackbar(`Product "${updatedProduct.name}" updated successfully!`, 'success');
    } catch (error) {
      console.error('Error updating product:', error);
      // Error handling is managed by TanStack Query
    }
  };

  const handleAddImage = () => {
    if (imageInput.trim()) {
      try {
        new URL(imageInput); // Validate URL
        setEditedProduct(prev => ({
          ...prev,
          images: [...prev.images, imageInput.trim()]
        }));
        setImageInput('');
      } catch {
        showSnackbar('Please enter a valid image URL', 'error');
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setEditedProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addVariation = () => {
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    setEditedProduct(prev => ({
      ...prev,
      variations: [
        ...prev.variations,
        {
          tempId,
          type: '',
          name: '',
          additionalPrice: '0',
          dynamicValues: {}
        }
      ]
    }));
  };

  const removeVariation = (index: number) => {
    setEditedProduct(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }));
  };

  const updateVariation = (index: number, field: string, value: string | number) => {
    setEditedProduct(prev => ({
      ...prev,
      variations: prev.variations.map((variation, i) => 
        i === index ? { ...variation, [field]: value } : variation
      )
    }));
  };

  const updateVariationDynamicValue = (variationIndex: number, fieldId: number, value: string | number | boolean | Date) => {
    setEditedProduct(prev => ({
      ...prev,
      variations: prev.variations.map((variation, i) => 
        i === variationIndex 
          ? { 
              ...variation, 
              dynamicValues: { ...variation.dynamicValues, [fieldId]: value }
            } 
          : variation
      )
    }));
  };

  const convertValue = (val: string | number | boolean | Date | undefined): string => {
    if (val === undefined || val === null) return '';
    if (typeof val === 'boolean') return val.toString();
    if (val instanceof Date) return val.toISOString().split('T')[0];
    return val.toString();
  };

  const renderDynamicField = (
    field: CategoryDynamicField,
    value: string | number | boolean | Date | undefined,
    onChange: (value: string | number | boolean | Date) => void,
    errorKey: string
  ) => {
    switch (field.fieldType) {
      case 'TEXT':
        return (
          <TextField
            key={field.id}
            label={field.fieldName}
            value={convertValue(value)}
            onChange={(e) => onChange(e.target.value)}
            error={errors[errorKey]}
            required={field.required}
            className="mb-4"
          />
        );

      case 'NUMBER':
        return (
          <TextField
            key={field.id}
            label={field.fieldName}
            type="number"
            value={convertValue(value)}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            error={errors[errorKey]}
            required={field.required}
            className="mb-4"
          />
        );

      case 'BOOLEAN':
        return (
          <div key={field.id} className="mb-4">
            <Checkbox
              checked={Boolean(value)}
              onChange={(checked) => onChange(checked)}
              label={`${field.fieldName}${field.required ? ' *' : ''}`}
            />
            {errors[errorKey] && (
              <p className="text-sm text-(--md-sys-color-error) mt-1">{errors[errorKey]}</p>
            )}
          </div>
        );

      case 'DATE':
        return (
          <TextField
            key={field.id}
            label={field.fieldName}
            type="date"
            value={convertValue(value)}
            onChange={(e) => onChange(new Date(e.target.value))}
            error={errors[errorKey]}
            required={field.required}
            className="mb-4"
          />
        );

      case 'COLOR_HASH':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-(--md-sys-color-on-surface) mb-2">
              {field.fieldName}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={convertValue(value) || '#000000'}
                onChange={(e) => onChange(e.target.value)}
                className="h-10 w-20 border rounded"
              />
              <TextField
                value={convertValue(value)}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#000000"
                error={errors[errorKey]}
                className="flex-1"
              />
            </div>
          </div>
        );

      default:
        return (
          <TextField
            key={field.id}
            label={field.fieldName}
            value={convertValue(value)}
            onChange={(e) => onChange(e.target.value)}
            error={errors[errorKey]}
            required={field.required}
            className="mb-4"
          />
        );
    }
  };

  return (
    <Card variant="elevated" className="mb-6 overflow-visible">
      {/* Header */}
      <div className="bg-(--md-sys-color-primary-container) p-6 pb-4">
        <h3 className="text-xl font-semibold text-(--md-sys-color-on-primary-container) mb-4">
          Edit Product: {product.name}
        </h3>
        
        {/* Tab Navigation */}
        <SegmentedButton
          options={TAB_OPTIONS}
          value={activeTab}
          onChange={setActiveTab}
          disabled={updateProduct.isPending}
        />
      </div>

      {/* Error Alert */}
      {updateProduct.isError && updateProduct.error && (
        <div className="mx-6 mt-4 p-4 bg-(--md-sys-color-error-container) text-(--md-sys-color-on-error-container) rounded-xl border border-(--md-sys-color-error)">
          <div className="flex items-center gap-3">
            <span className="mdi text-xl">error</span>
            <span className="font-medium">
              {updateProduct.error.message || 'Failed to update product'}
            </span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleUpdateProduct} className="p-6 pt-4">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            {/* Product Name */}
            <TextField
              label="Product Name"
              value={editedProduct.name}
              onChange={(e) => setEditedProduct(prev => ({ ...prev, name: e.target.value }))}
              error={errors.name}
              required
              className="w-full"
            />

            {/* Description */}
            <TextArea
              label="Description"
              value={editedProduct.description}
              onChange={(e) => setEditedProduct(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full"
            />

            {/* Base Price and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Base Price"
                type="number"
                step="0.01"
                value={editedProduct.basePrice}
                onChange={(e) => setEditedProduct(prev => ({ ...prev, basePrice: e.target.value }))}
                error={errors.basePrice}
                required
              />

              <Select
                label="Category"
                value={editedProduct.categoryId}
                onChange={(value) => setEditedProduct(prev => ({ ...prev, categoryId: value }))}
                required
                disabled={categoriesLoading}
                options={[
                  { value: '', label: 'Select a category...' },
                  ...categories.map(cat => ({
                    value: cat.id.toString(),
                    label: cat.name,
                  })),
                ]}
              />
            </div>

            {/* Images */}
            <div>
              <h4 className="text-lg font-medium text-(--md-sys-color-on-surface) mb-3">
                Product Images
              </h4>
              
              <div className="flex gap-2 mb-3">
                <TextField
                  label="Image URL"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
                <Button
                  variant="outlined"
                  label="Add Image"
                  onClick={handleAddImage}
                  disabled={!imageInput.trim()}
                />
              </div>

              {editedProduct.images.length > 0 && (
                <div className="space-y-2">
                  {editedProduct.images.map((image, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-(--md-sys-color-surface-container-lowest) rounded">
                      <img
                        src={image}
                        alt={`Product image ${index + 1}`}
                        className="h-12 w-12 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.png';
                        }}
                      />
                      <span className="flex-1 text-sm text-(--md-sys-color-on-surface) truncate">
                        {image}
                      </span>
                      <Button
                        variant="text"
                        hasIcon
                        icon="delete"
                        onClick={() => handleRemoveImage(index)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Fields Tab */}
        {activeTab === 'dynamic' && (
          <div className="space-y-6">
            {selectedCategory?.dynamicFields && selectedCategory.dynamicFields.filter(field => field.appliesTo === 'PRODUCT').length > 0 ? (
              <>
                <h4 className="text-lg font-medium text-(--md-sys-color-on-surface)">
                  Dynamic Fields for {selectedCategory.name}
                </h4>
                {selectedCategory.dynamicFields
                  .filter(field => field.appliesTo === 'PRODUCT')
                  .map(field => 
                    renderDynamicField(
                      field,
                      editedProduct.dynamicValues[field.id],
                      (value) => setEditedProduct(prev => ({
                        ...prev,
                        dynamicValues: { ...prev.dynamicValues, [field.id]: value }
                      })),
                      `dynamic_${field.id}`
                    )
                  )
                }
              </>
            ) : (
              <div className="text-center py-8 text-(--md-sys-color-on-surface-variant)">
                {selectedCategory ? 
                  `No product-level dynamic fields configured for ${selectedCategory.name}` :
                  'Please select a category first to see dynamic fields'
                }
              </div>
            )}
          </div>
        )}

        {/* Variations Tab */}
        {activeTab === 'variations' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium text-(--md-sys-color-on-surface)">
                Product Variations
              </h4>
              <Button
                variant="outlined"
                hasIcon
                icon="add"
                label="Add Variation"
                onClick={addVariation}
              />
            </div>

            {editedProduct.variations.length > 0 ? (
              <div className="space-y-4">
                {editedProduct.variations.map((variation, index) => (
                  <Card key={variation.tempId} variant="outlined" className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="font-medium text-(--md-sys-color-on-surface)">
                        Variation {index + 1}
                      </h5>
                      <Button
                        variant="text"
                        hasIcon
                        icon="delete"
                        onClick={() => removeVariation(index)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <TextField
                        label="Variation Type"
                        value={variation.type}
                        onChange={(e) => updateVariation(index, 'type', e.target.value)}
                        placeholder="e.g., Color, Size"
                        required
                      />

                      <TextField
                        label="Variation Name"
                        value={variation.name}
                        onChange={(e) => updateVariation(index, 'name', e.target.value)}
                        error={errors[`variation_${index}_name`]}
                        required
                      />

                      <TextField
                        label="Additional Price"
                        type="number"
                        step="0.01"
                        value={variation.additionalPrice}
                        onChange={(e) => updateVariation(index, 'additionalPrice', e.target.value)}
                        error={errors[`variation_${index}_additionalPrice`]}
                        required
                      />
                    </div>

                    {/* Dynamic Fields for Variation */}
                    {selectedCategory?.dynamicFields && selectedCategory.dynamicFields.filter(field => field.appliesTo === 'VARIATION').length > 0 && (
                      <div className="mt-4 pt-4 border-t border-(--md-sys-color-outline-variant)">
                        <h6 className="text-sm font-medium text-(--md-sys-color-on-surface) mb-3">
                          Variation Dynamic Fields
                        </h6>
                        {selectedCategory.dynamicFields
                          .filter(field => field.appliesTo === 'VARIATION')
                          .map(field => 
                            renderDynamicField(
                              field,
                              variation.dynamicValues[field.id],
                              (value) => updateVariationDynamicValue(index, field.id, value),
                              `variation_${index}_dynamic_${field.id}`
                            )
                          )
                        }
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-(--md-sys-color-on-surface-variant)">
                No variations added yet. Click &quot;Add Variation&quot; to create product variations.
              </div>
            )}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-(--md-sys-color-outline-variant)">
          <Button
            variant="outlined"
            label="Cancel"
            onClick={onCancel}
            disabled={updateProduct.isPending}
          />
          <Button
            variant="filled"
            label={updateProduct.isPending ? "Updating..." : "Update Product"}
            type="submit"
            disabled={updateProduct.isPending}
            hasIcon={updateProduct.isPending}
            icon={updateProduct.isPending ? "hourglass_empty" : undefined}
          />
        </div>
      </form>

      {/* Snackbar */}
      <Snackbar
        isOpen={snackbar.isOpen}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </Card>
  );
}
