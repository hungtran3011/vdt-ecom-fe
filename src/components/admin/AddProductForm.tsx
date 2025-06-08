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
import { useCreateProduct } from '@/hooks/useProducts';
import { useSnackbar } from '@/hooks/useSnackbar';
import { 
  CreateProductRequest, 
  Product, 
  ProductVariation, 
  ProductDynamicValue 
} from '@/types/Product';
import { Category, CategoryDynamicField } from '@/types/Category';

interface AddProductFormProps {
  onCancel: () => void;
  onProductAdded: (product: Product) => void;
}

interface NewProductFormVariation {
  tempId: string;
  type: string;
  name: string;
  additionalPrice: string;
  dynamicValues: { [fieldId: number]: string | number | boolean | Date };
}

interface NewProductForm {
  name: string;
  description: string;
  basePrice: string;
  categoryId: string;
  images: string[];
  dynamicValues: { [fieldId: number]: string | number | boolean | Date };
  variations: NewProductFormVariation[];
}

const TAB_OPTIONS = [
  { value: 'basic', label: 'Basic Info', icon: 'info' },
  { value: 'dynamic', label: 'Dynamic Fields', icon: 'tune' },
  { value: 'variations', label: 'Variations', icon: 'palette' },
];

export default function AddProductForm({ onCancel, onProductAdded }: AddProductFormProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [newProduct, setNewProduct] = useState<NewProductForm>({
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
  
  // Use TanStack Query for categories and product creation
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const createProduct = useCreateProduct();
  
  // Snackbar for notifications
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  // Update selected category when categoryId changes
  useEffect(() => {
    if (newProduct.categoryId) {
      const category = categories.find(cat => cat.id === parseInt(newProduct.categoryId));
      setSelectedCategory(category || null);
      
      // Reset dynamic values when category changes
      setNewProduct(prev => ({
        ...prev,
        dynamicValues: {},
        variations: prev.variations.map(variation => ({
          ...variation,
          dynamicValues: {}
        }))
      }));
    }
  }, [newProduct.categoryId, categories]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Basic validation
    if (!newProduct.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!newProduct.basePrice || parseFloat(newProduct.basePrice) < 0) {
      newErrors.basePrice = 'Valid base price is required';
    }

    if (!newProduct.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    // Dynamic fields validation
    if (selectedCategory?.dynamicFields) {
      selectedCategory.dynamicFields
        .filter(field => field.appliesTo === 'PRODUCT' && field.required)
        .forEach(field => {
          if (!newProduct.dynamicValues[field.id] && newProduct.dynamicValues[field.id] !== false) {
            newErrors[`dynamic_${field.id}`] = `${field.fieldName} is required`;
          }
        });
    }

    // Variations validation
    newProduct.variations.forEach((variation, index) => {
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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Prepare dynamic values
      const dynamicValues: Omit<ProductDynamicValue, 'id' | 'productId'>[] = [];
      Object.entries(newProduct.dynamicValues).forEach(([fieldId, value]) => {
        const field = selectedCategory?.dynamicFields?.find(f => f.id === parseInt(fieldId));
        if (field && value !== undefined && value !== '') {
          dynamicValues.push({
            field: field,
            value: value
          });
        }
      });

      // Prepare variations
      const variations: Omit<ProductVariation, 'id' | 'productId'>[] = newProduct.variations.map(variation => {
        const variationDynamicValues: ProductDynamicValue[] = [];
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

        return {
          type: variation.type,
          name: variation.name,
          additionalPrice: parseFloat(variation.additionalPrice),
          dynamicValues: variationDynamicValues.length > 0 ? variationDynamicValues : undefined
        };
      });

      // Create the product data to send to the API
      const productData: CreateProductRequest = {
        name: newProduct.name.trim(),
        description: newProduct.description.trim() || undefined,
        basePrice: parseFloat(newProduct.basePrice),
        categoryId: parseInt(newProduct.categoryId),
        images: newProduct.images.length > 0 ? newProduct.images : undefined,
        dynamicValues: dynamicValues.length > 0 ? dynamicValues : undefined,
        variations: variations.length > 0 ? variations : undefined
      };

      const addedProduct = await createProduct.mutateAsync(productData);
      onProductAdded(addedProduct);
      
      // Reset form
      setNewProduct({
        name: '',
        description: '',
        basePrice: '',
        categoryId: '',
        images: [],
        dynamicValues: {},
        variations: []
      });
      setSelectedCategory(null);
      setActiveTab('basic');
      
      showSnackbar(`Product "${addedProduct.name}" created successfully!`, 'success');
    } catch (error) {
      console.error('Error adding product:', error);
      // Error handling is managed by TanStack Query
    }
  };

  const handleAddImage = () => {
    if (imageInput.trim()) {
      try {
        new URL(imageInput); // Validate URL
        setNewProduct(prev => ({
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
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addVariation = () => {
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    setNewProduct(prev => ({
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
    setNewProduct(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }));
  };

  const updateVariation = (index: number, field: string, value: string | number) => {
    setNewProduct(prev => ({
      ...prev,
      variations: prev.variations.map((variation, i) => 
        i === index ? { ...variation, [field]: value } : variation
      )
    }));
  };

  const updateVariationDynamicValue = (variationIndex: number, fieldId: number, value: string | number | boolean | Date) => {
    setNewProduct(prev => ({
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

  const renderDynamicField = (
    field: CategoryDynamicField,
    value: string | number | boolean | Date | undefined,
    onChange: (value: string | number | boolean | Date) => void,
    errorKey: string
  ) => {
    const convertValue = (val: string | number | boolean | Date | undefined): string => {
      if (val === undefined || val === null) return '';
      if (typeof val === 'boolean') return val.toString();
      if (val instanceof Date) return val.toISOString().split('T')[0];
      return val.toString();
    };

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
    <Card variant="elevated" className="mb-6 overflow-visible relative">
      {/* Header */}
      <div className="bg-(--md-sys-color-primary-container) p-6 pb-4">
        <h3 className="text-xl font-semibold text-(--md-sys-color-on-primary-container) mb-4">
          Add New Product
        </h3>
        
        {/* Tab Navigation */}
        <SegmentedButton
          options={TAB_OPTIONS}
          value={activeTab}
          onChange={setActiveTab}
          disabled={createProduct.isPending}
        />
      </div>

      {/* Error Alert */}
      {createProduct.isError && createProduct.error && (
        <div className="mx-6 mt-4 p-4 bg-(--md-sys-color-error-container) text-(--md-sys-color-on-error-container) rounded-xl border border-(--md-sys-color-error)">
          <div className="flex items-center gap-3">
            <span className="mdi text-xl">error</span>
            <span className="font-medium">
              {createProduct.error.message || 'Failed to add product'}
            </span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleAddProduct} className="p-6 pt-4 overflow-visible relative">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-6 overflow-visible">
            {/* Product Name */}
            <TextField
              label="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
              error={errors.name}
              required
              className="w-full"
            />

            {/* Description */}
            <TextArea
              label="Description"
              value={newProduct.description}
              onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full"
            />

            {/* Base Price and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-visible relative">
              <TextField
                label="Base Price"
                type="number"
                step="0.01"
                value={newProduct.basePrice}
                onChange={(e) => setNewProduct(prev => ({ ...prev, basePrice: e.target.value }))}
                error={errors.basePrice}
                required
              />

              <Select
                label="Category"
                value={newProduct.categoryId}
                onChange={(value) => setNewProduct(prev => ({ ...prev, categoryId: value }))}
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

              {newProduct.images.length > 0 && (
                <div className="space-y-2">
                  {newProduct.images.map((image, index) => (
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
                      newProduct.dynamicValues[field.id],
                      (value) => setNewProduct(prev => ({
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

            {newProduct.variations.length > 0 ? (
              <div className="space-y-4">
                {newProduct.variations.map((variation, index) => (
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
            disabled={createProduct.isPending}
          />
          <Button
            variant="filled"
            label={createProduct.isPending ? "Creating..." : "Create Product"}
            type="submit"
            disabled={createProduct.isPending}
            hasIcon={createProduct.isPending}
            icon={createProduct.isPending ? "hourglass_empty" : undefined}
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
