'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import Select from '@/components/Select';
import Checkbox from '@/components/Checkbox';
import { List, ListItem } from '@/components/List';
import Snackbar from '@/components/Snackbar';
import { useStockItems, useBulkUpdateStock } from '@/hooks/useStock';
import { useSnackbar } from '@/hooks/useSnackbar';
import { StockItem } from '@/types/Stock';
import { formatVND } from '@/utils/currency';
import { t } from '@/utils/localization';

interface BulkUpdateItem extends StockItem {
  selected: boolean;
  newQuantity: number;
  updateReason: string;
}

interface BulkStockUpdateProps {
  onClose: () => void;
  className?: string;
}

export default function BulkStockUpdate({ onClose, className = '' }: BulkStockUpdateProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [updateItems, setUpdateItems] = useState<BulkUpdateItem[]>([]);
  const [globalReason, setGlobalReason] = useState('');
  const [useGlobalReason, setUseGlobalReason] = useState(true);

  // Snackbar for notifications
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  // TanStack Query hooks
  const { data: stockData, isLoading } = useStockItems({
    search: searchTerm || undefined,
    size: 50 // Get more items for bulk operations
  });

  const bulkUpdate = useBulkUpdateStock();

  const stockItems = stockData?.data || [];

  // Initialize update items when stock data loads
  const initializeUpdateItems = () => {
    if (stockItems.length > 0 && updateItems.length === 0) {
      const items = stockItems.map((item: StockItem) => ({
        ...item,
        selected: false,
        newQuantity: item.availableStock,
        updateReason: ''
      }));
      setUpdateItems(items);
    }
  };

  // Call initialization when data loads
  if (stockItems.length > 0 && updateItems.length === 0) {
    initializeUpdateItems();
  }

  const handleSelectItem = (itemId: number, selected: boolean) => {
    setUpdateItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, selected } : item
      )
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setUpdateItems(prev => 
      prev.map(item => ({ ...item, selected }))
    );
  };

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    setUpdateItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, newQuantity } : item
      )
    );
  };

  const handleReasonChange = (itemId: number, reason: string) => {
    setUpdateItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, updateReason: reason } : item
      )
    );
  };

  const handleBulkUpdate = async () => {
    const selectedItems = updateItems.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      showSnackbar(t('stock.noItemsSelected'), 'error');
      return;
    }

    // Validate that all selected items have reasons
    const itemsWithoutReason = selectedItems.filter(item => 
      !useGlobalReason && !item.updateReason.trim()
    );

    if (!useGlobalReason && itemsWithoutReason.length > 0) {
      showSnackbar(t('stock.reasonRequiredForAllItems'), 'error');
      return;
    }

    if (useGlobalReason && !globalReason.trim()) {
      showSnackbar(t('stock.globalReasonRequired'), 'error');
      return;
    }

    try {
      const updates = selectedItems.map(item => ({
        stockId: item.id, // Use stockId instead of productId
        quantity: item.newQuantity,
        reason: useGlobalReason ? globalReason : item.updateReason
      }));

      await bulkUpdate.mutateAsync(updates);
      showSnackbar(t('stock.bulkUpdateSuccess'), 'success');
      onClose();
    } catch (error) {
      showSnackbar(t('stock.bulkUpdateError'), 'error');
      console.error('Bulk update error:', error);
    }
  };

  const selectedCount = updateItems.filter(item => item.selected).length;
  const hasChanges = updateItems.some(item => 
    item.selected && item.newQuantity !== item.availableStock
  );

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}>
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-on-surface">{t('stock.bulkStockUpdate')}</h2>
              <p className="text-on-surface-variant mt-1">
                {t('stock.bulkUpdateDescription')}
              </p>
            </div>
            <Button
              variant="text"
              hasIcon
              icon="close"
              onClick={onClose}
            />
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="p-6 border-b border-outline-variant">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <TextField
              label={t('stock.searchProducts')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('stock.searchProductsPlaceholder')}
            />
            <Select
              label={t('product.category')}
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: 'all', label: t('stock.allCategories') },
                // Add categories here if needed
              ]}
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outlined"
                label={t('stock.selectAll')}
                onClick={() => handleSelectAll(true)}
              />
              <Button
                variant="outlined"
                label={t('stock.selectNone')}
                onClick={() => handleSelectAll(false)}
              />
            </div>
          </div>

          {/* Global Reason */}
          <div className="space-y-3">
            <Checkbox
              label={t('stock.useGlobalReason')}
              checked={useGlobalReason}
              onChange={setUseGlobalReason}
            />
            {useGlobalReason && (
              <TextField
                label={t('stock.globalUpdateReason')}
                value={globalReason}
                onChange={(e) => setGlobalReason(e.target.value)}
                placeholder={t('stock.globalReasonPlaceholder')}
                required
              />
            )}
          </div>

          {/* Summary */}
          <div className="mt-4 p-3 bg-surface-container-lowest rounded-lg">
            <div className="text-sm text-on-surface-variant">
              {t('stock.selectedItems')}: <span className="font-medium">{selectedCount}</span> / {updateItems.length} |
              {t('stock.hasChanges')}: <span className="font-medium">{hasChanges ? t('common.yes') : t('common.no')}</span>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center">
              <span className="mdi text-2xl text-on-surface-variant animate-spin">refresh</span>
              <p className="text-on-surface-variant mt-2">{t('common.loading')}</p>
            </div>
          ) : updateItems.length === 0 ? (
            <div className="p-6 text-center">
              <span className="mdi text-4xl text-on-surface-variant">inventory</span>
              <p className="text-on-surface-variant mt-2">{t('stock.noStockItems')}</p>
            </div>
          ) : (
            <List>
              {updateItems.map((item) => (
                <ListItem
                  key={item.id}
                  leading={
                    <Checkbox
                      label=""
                      checked={item.selected}
                      onChange={(checked) => handleSelectItem(item.id, checked)}
                    />
                  }
                  trailing={
                    <div className="flex items-center gap-2">
                      <div className="text-right min-w-[80px]">
                        <div className="text-sm font-medium text-on-surface">
                          {formatVND(item.availableStock * item.unitCost)}
                        </div>
                        <div className="text-xs text-on-surface-variant">
                          {t('stock.currentValue')}
                        </div>
                      </div>
                    </div>
                  }
                >
                  <div className="space-y-2">
                    <div className="font-medium text-on-surface">{item.productName}</div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <TextField
                          label={t('stock.newQuantity')}
                          type="number"
                          value={String(item.newQuantity)}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                          disabled={!item.selected}
                        />
                        {!useGlobalReason && (
                          <TextField
                            label={t('stock.updateReason')}
                            value={item.updateReason}
                            onChange={(e) => handleReasonChange(item.id, e.target.value)}
                            placeholder={t('stock.reasonPlaceholder')}
                            disabled={!item.selected}
                            required={item.selected}
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                        <span>{t('stock.category')}: {item.categoryName}</span>
                        <span>{t('stock.currentStock')}: {item.availableStock}</span>
                        <span>{t('stock.reserved')}: {item.reservedStock}</span>
                        <span>{t('stock.minLevel')}: {item.minStockLevel}</span>
                      </div>
                      {item.selected && item.newQuantity !== item.availableStock && (
                        <div className="p-2 bg-primary-container rounded text-xs">
                          <span className="text-on-primary-container">
                            {t('stock.change')}: {item.newQuantity > item.availableStock ? '+' : ''}
                            {item.newQuantity - item.availableStock}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </ListItem>
              ))}
            </List>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-outline-variant">
          <div className="flex justify-between items-center">
            <div className="text-sm text-on-surface-variant">
              {selectedCount > 0 && (
                <>
                  {t('stock.selectedItems')}: {selectedCount} •{' '}
                  {hasChanges ? t('stock.hasUnsavedChanges') : t('stock.noChanges')}
                </>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outlined"
                label={t('actions.cancel')}
                onClick={onClose}
              />
              <Button
                variant="filled"
                label={bulkUpdate.isPending ? t('stock.updating') : t('stock.updateSelected')}
                onClick={handleBulkUpdate}
                disabled={bulkUpdate.isPending || selectedCount === 0 || !hasChanges}
              />
            </div>
          </div>
        </div>

        {/* Snackbar */}
        <Snackbar
          isOpen={snackbar.isOpen}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={hideSnackbar}
        />
      </Card>
    </div>
  );
}
