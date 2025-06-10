'use client';

import { useState, useMemo, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Card from '@/components/Card';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import Select from '@/components/Select';
import Snackbar from '@/components/Snackbar';
import { useProducts } from '@/hooks/useProducts';
import { useCreateStock } from '@/hooks/useStock';
import { useSnackbar } from '@/hooks/useSnackbar';
import { StockItem, CreateStockRequest } from '@/types/Stock';
import { Product, ProductVariation } from '@/types/Product';
import { t } from '@/utils/localization';

// Form validation schema
const addStockSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  productId: z.number().min(1, 'Product is required'),
  variations: z.array(z.object({
    id: z.number(),
    name: z.string(),
    values: z.array(z.string()),
  })).optional(),
  quantity: z.number().min(0, 'Quantity must be 0 or greater'),
  lowStockThreshold: z.number().min(0, 'Low stock threshold must be 0 or greater').optional(),
});

type AddStockFormData = z.infer<typeof addStockSchema>;

interface AddStockFormProps {
  onCancel: () => void;
  onStockAdded: (stock: StockItem) => void;
}

export default function AddStockForm({ onCancel, onStockAdded }: AddStockFormProps) {
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [selectedVariations, setSelectedVariations] = useState<{
    [variationId: number]: string[];
  }>({});

  // Snackbar for notifications
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  // TanStack Query hooks
  const { data: productsData, isLoading, error } = useProducts({ size: 100 }); // Get products for selection
  const createStock = useCreateStock();

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    reset
  } = useForm<AddStockFormData>({
    resolver: zodResolver(addStockSchema),
    defaultValues: {
      sku: '',
      quantity: 0,
      lowStockThreshold: 10,
    },
  });

  const products = useMemo(() => productsData?.content || [], [productsData?.content]);

  // Memoize product options to prevent re-rendering
  const productOptions = useMemo(() => 
    products.map((product: Product) => ({
      value: product.id.toString(),
      label: `${product.name} (ID: ${product.id})`,
    })), [products]
  );

  // Memoize selected product info
  const selectedProductInfo = useMemo(() => 
    selectedProduct ? products.find((p: Product) => p.id === selectedProduct) : null,
    [selectedProduct, products]
  );

  // Memoize the product selection handler
  const handleProductChange = useCallback((value: string) => {
    const productId = parseInt(value);
    setValue('productId', productId);
    setSelectedProduct(productId);
    // Reset variations when product changes
    setSelectedVariations({});
  }, [setValue]);

  // Memoize the variation change handler
  const handleVariationChange = useCallback((variationId: number, value: string) => {
    const values = value.split(',').map(v => v.trim()).filter(v => v);
    setSelectedVariations(prev => ({
      ...prev,
      [variationId]: values
    }));
  }, []);

  const onSubmit: SubmitHandler<AddStockFormData> = async (data) => {
    try {
      console.log('[AddStockForm] Form submission data:', data);
      console.log('[AddStockForm] Selected product:', selectedProduct);
      console.log('[AddStockForm] Selected variations:', selectedVariations);
      
      // Build variations array for the request
      const variations = Object.entries(selectedVariations).map(([variationId, values]) => {
        const selectedProductInfo = products.find((p: Product) => p.id === selectedProduct);
        const variation = selectedProductInfo?.variations?.find((v: ProductVariation) => v.id === parseInt(variationId));
        return {
          id: parseInt(variationId),
          name: variation?.name || '',
          values: values,
        };
      }).filter(v => v.values.length > 0);
      
      const stockRequest: CreateStockRequest = {
        sku: data.sku,
        productId: data.productId,
        variations: variations.length > 0 ? variations : undefined,
        quantity: data.quantity,
        lowStockThreshold: data.lowStockThreshold,
      };

      console.log('[AddStockForm] Stock request to be sent:', stockRequest);

      const newStock = await createStock.mutateAsync(stockRequest);
      showSnackbar(t('stock.createSuccess'), 'success');
      onStockAdded(newStock);
      reset();
      setSelectedVariations({});
    } catch (error) {
      console.error('Error creating stock:', error);
      showSnackbar(t('stock.createError'), 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Header */}
          <div className="p-6 border-b border-(--md-sys-color-outline-variant)">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-(--md-sys-color-on-surface)">
                  {t('stock.addStockItem')}
                </h2>
                <p className="text-(--md-sys-color-on-surface-variant) mt-1">
                  {t('stock.addStockDescription')}
                </p>
              </div>
              <Button
                type="button"
                variant="text"
                hasIcon
                icon="close"
                onClick={onCancel}
              />
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Product Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-(--md-sys-color-on-surface)">
                {t('product.productInfo')}
              </h3>
              
              <div>
                <Select
                  label={t('product.selectProduct')}
                  value={selectedProduct?.toString() || ''}
                  onChange={handleProductChange}
                  options={productOptions}
                  disabled={isLoading}
                  required
                />
                {/* Hidden field to ensure productId is registered with the form */}
                <input
                  type="hidden"
                  {...register('productId', { valueAsNumber: true })}
                />
                {isLoading && (
                  <p className="text-sm text-(--md-sys-color-on-surface-variant) mt-1">
                    {t('common.loading')}...
                  </p>
                )}
                {error && (
                  <p className="text-sm text-(--md-sys-color-error) mt-1">
                    {t('common.error')}: {error.message}
                  </p>
                )}
                {errors.productId && (
                  <p className="text-sm text-(--md-sys-color-error) mt-1">
                    {errors.productId.message}
                  </p>
                )}
              </div>

              {selectedProductInfo && (
                <Card variant="outlined" className="p-4 bg-(--md-sys-color-surface-container-lowest)">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-(--md-sys-color-on-surface-variant)">{t('product.name')}:</span>
                      <span className="font-medium">{selectedProductInfo.name}</span>
                    </div>
                    {selectedProductInfo.category?.name && (
                      <div className="flex justify-between">
                        <span className="text-(--md-sys-color-on-surface-variant)">{t('product.category')}:</span>
                        <span>{selectedProductInfo.category.name}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-(--md-sys-color-on-surface-variant)">{t('product.basePrice')}:</span>
                      <span>{selectedProductInfo.basePrice.toLocaleString('vi-VN')} VND</span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Product Variations */}
              {selectedProductInfo?.variations && selectedProductInfo.variations.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-(--md-sys-color-on-surface)">
                    {t('product.variations')}
                  </h4>
                  <p className="text-sm text-(--md-sys-color-on-surface-variant)">
                    {t('stock.selectVariationsDescription')}
                  </p>
                  <div className="space-y-4">
                    {selectedProductInfo.variations.map((variation: ProductVariation) => (
                      <Card key={variation.id} variant="outlined" className="p-4">
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-(--md-sys-color-on-surface)">
                            {variation.name}
                          </label>
                          <div className="space-y-2">
                            {/* Dynamic Values Input */}
                            <TextField
                              label={t('stock.variationValues')}
                              placeholder={t('stock.variationValuesPlaceholder')}
                              onChange={(e) => handleVariationChange(variation.id, e.target.value)}
                              value={selectedVariations[variation.id]?.join(', ') || ''}
                            />
                            <p className="text-xs text-(--md-sys-color-on-surface-variant)">
                              {t('stock.variationValuesHint')}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stock Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-(--md-sys-color-on-surface)">
                {t('stock.stockInfo')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label={t('stock.sku')}
                  {...register('sku')}
                  error={errors.sku?.message}
                  placeholder={t('stock.skuPlaceholder')}
                  required
                />

                <TextField
                  label={t('stock.quantity')}
                  type="number"
                  min="0"
                  {...register('quantity', { valueAsNumber: true })}
                  error={errors.quantity?.message}
                  required
                />

                <TextField
                  label={t('stock.lowStockThreshold')}
                  type="number"
                  min="0"
                  {...register('lowStockThreshold', { valueAsNumber: true })}
                  error={errors.lowStockThreshold?.message}
                  placeholder={t('stock.lowStockThresholdPlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-(--md-sys-color-outline-variant)">
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outlined"
                label={t('actions.cancel')}
                onClick={onCancel}
              />
              <Button
                type="submit"
                variant="filled"
                label={createStock.isPending ? t('stock.creating') : t('stock.createStockItem')}
                disabled={createStock.isPending || !isValid}
              />
            </div>
          </div>
        </form>
      </Card>

      {/* Snackbar */}
      <Snackbar
        isOpen={snackbar.isOpen}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </div>
  );
}
