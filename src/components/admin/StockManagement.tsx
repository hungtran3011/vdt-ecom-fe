'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import Select from '@/components/Select';
import Chip, { ChipColor } from '@/components/Chip';
import { List, ListItem } from '@/components/List';
import Snackbar from '@/components/Snackbar';
import Pagination from '@/components/Pagination';
import StockDashboard from './StockDashboard';
import StockMovementHistory from './StockMovementHistory';
import BulkStockUpdate from './BulkStockUpdate';
import AddStockForm from './AddStockForm';
import { usePagination } from '@/hooks/usePagination';
import { 
  useStockItems, 
  useStockSummary, 
  useAdjustStock,
  useExportStockReport
} from '@/hooks/useStock';
import { useSnackbar } from '@/hooks/useSnackbar';
import { 
  StockItem, 
  StockMovementType,
  StockMovementTypeLabels,
  StockManagementProps 
} from '@/types/Stock';
import { 
  formatApiError 
} from '@/utils/validation';
import { formatVND } from '@/utils/currency';
import { t } from '@/utils/localization';

export default function StockManagement({ 
  title = t('sections.stockManagement'),
  className = "",
  showFilters = true,
  showActions = true
}: StockManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [isAdjustingStock, setIsAdjustingStock] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<StockMovementType>(StockMovementType.ADJUSTMENT);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [currentView, setCurrentView] = useState<'list' | 'dashboard' | 'history' | 'bulk'>('list');
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [showAddStockForm, setShowAddStockForm] = useState(false);

  // Pagination state
  const pagination = usePagination();

  // Snackbar for notifications
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  // TanStack Query hooks
  const {
    data: stockData, 
    isError, 
    refetch 
  } = useStockItems({
    page: pagination.paginationParams.page,
    size: pagination.paginationParams.size,
    cursor: pagination.paginationParams.cursor,
    search: searchTerm || undefined,
    lowStock: statusFilter === 'low' || undefined,
    outOfStock: statusFilter === 'out' || undefined
  });

  const { data: stockSummary } = useStockSummary();

  const adjustStock = useAdjustStock();
  const exportReport = useExportStockReport();

  const stockItems = stockData?.data || [];

  const getStockStatus = (item: StockItem) => {
    if (item.availableStock <= 0) return 'out';
    if (item.availableStock <= item.minStockLevel) return 'low';
    return 'normal';
  };

  const getStockStatusColor = (status: string): ChipColor => {
    switch (status) {
      case 'out': return 'error';
      case 'low': return 'tertiary';
      default: return 'primary';
    }
  };

  const getStockStatusLabel = (status: string) => {
    switch (status) {
      case 'out': return t('stock.outOfStockLabel');
      case 'low': return t('stock.lowStockLabel');
      default: return t('stock.inStock');
    }
  };

  const handleStockAdjustment = async () => {
    if (!selectedItem) {
      showSnackbar(t('stock.noItemSelected'), 'error');
      return;
    }

    // Validate form data
    const quantity = parseInt(adjustmentQuantity) || 0;
    
    if (quantity <= 0) {
      showSnackbar(t('form.validation.positive'), 'error');
      return;
    }

    if (!adjustmentReason.trim()) {
      showSnackbar(t('form.validation.required'), 'error');
      return;
    }

    // Additional business logic validation  
    if (adjustmentType === StockMovementType.OUT && 
        quantity > selectedItem.availableStock) {
      showSnackbar(t('stock.cannotRemoveMoreThanAvailable'), 'error');
      return;
    }

    try {
      // Use the new adjustStock API
      await adjustStock.mutateAsync({
        stockId: selectedItem.id,
        data: {
          quantity: adjustmentType === StockMovementType.OUT ? -quantity : quantity,
          reason: adjustmentReason,
          reference: `Manual adjustment - ${adjustmentType}`
        }
      });
      showSnackbar(t('messages.success.stockAdjustmentCompleted'), 'success');
      setIsAdjustingStock(false);
      setSelectedItem(null);
      setAdjustmentQuantity('');
      setAdjustmentReason('');
    } catch (error) {
      const errorMessage = formatApiError(error);
      showSnackbar(`${t('stock.failedToAdjust')}: ${errorMessage}`, 'error');
      console.error('Stock adjustment error:', error);
    }
  };

  const handleExportReport = async (format: 'csv' | 'xlsx') => {
    if (!format || !['csv', 'xlsx'].includes(format)) {
      showSnackbar(t('stock.invalidExportFormat'), 'error');
      return;
    }

    try {
      await exportReport.mutateAsync(format);
      showSnackbar(`${t('stock.stockReportExported')} ${format.toUpperCase()}`, 'success');
    } catch (error) {
      const errorMessage = formatApiError(error);
      showSnackbar(`Failed to export report: ${errorMessage}`, 'error');
      console.error('Export error:', error);
    }
  };

  const handleStockAdded = (newStock: StockItem) => {
    showSnackbar(`${t('stock.createSuccess')} - ${newStock.productName}`, 'success');
    setShowAddStockForm(false);
    // Refresh the stock list
    refetch();
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-(--md-sys-color-on-surface)">{title}</h1>
          {stockSummary && (
            <p className="text-(--md-sys-color-on-surface-variant) mt-1">
              {stockSummary.totalProducts} {t('stock.stockSummary')} ${stockSummary.totalStockValue.toFixed(2)}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          {/* View Navigation */}
          <div className="flex rounded-lg border border-(--md-sys-color-outline) overflow-hidden">
            <Button
              variant={currentView === 'dashboard' ? 'filled' : 'text'}
              hasIcon
              icon="dashboard"
              label={t('stock.dashboard')}
              onClick={() => setCurrentView('dashboard')}
              className="rounded-none"
            />
            <Button
              variant={currentView === 'list' ? 'filled' : 'text'}
              hasIcon
              icon="list"
              label={t('stock.stockList')}
              onClick={() => setCurrentView('list')}
              className="rounded-none"
            />
            <Button
              variant={currentView === 'history' ? 'filled' : 'text'}
              hasIcon
              icon="history"
              label={t('stock.history')}
              onClick={() => setCurrentView('history')}
              className="rounded-none"
            />
          </div>

          {showActions && currentView === 'list' && (
            <>
              <Button
                variant="filled"
                hasIcon
                icon="add"
                label={t('stock.addStockItem')}
                onClick={() => setShowAddStockForm(true)}
              />
              <Button
                variant="outlined"
                hasIcon
                icon="edit_note"
                label={t('stock.bulkUpdate')}
                onClick={() => setShowBulkUpdate(true)}
              />
              <Button
                variant="outlined"
                hasIcon
                icon="download"
                label={t('stock.exportCSV')}
                onClick={() => handleExportReport('csv')}
                disabled={exportReport.isPending}
              />
              <Button
                variant="outlined"
                hasIcon
                icon="download"
                label={t('stock.exportExcel')}
                onClick={() => handleExportReport('xlsx')}
                disabled={exportReport.isPending}
              />
            </>
          )}
        </div>
      </div>

      {/* Render different views */}
      {currentView === 'dashboard' && (
        <StockDashboard />
      )}

      {currentView === 'history' && (
        <StockMovementHistory />
      )}

      {currentView === 'list' && (
        <>
          {/* Summary Cards */}
          {stockSummary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <div className="text-2xl font-bold text-(--md-sys-color-primary)">
                  {stockSummary.totalProducts}
                </div>
                <div className="text-sm text-(--md-sys-color-on-surface-variant)">{t('stats.totalProducts')}</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-(--md-sys-color-primary)">
                  {formatVND(stockSummary.totalStockValue)}
                </div>
                <div className="text-sm text-(--md-sys-color-on-surface-variant)">{t('stock.stockValue')}</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-(--md-sys-color-error)">
                  {stockSummary.lowStockItems}
                </div>
                <div className="text-sm text-(--md-sys-color-on-surface-variant)">{t('stock.lowStock')}</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-(--md-sys-color-error)">
                  {stockSummary.outOfStockItems}
                </div>
                <div className="text-sm text-(--md-sys-color-on-surface-variant)">{t('stock.outOfStock')}</div>
              </Card>
            </div>
          )}

          {/* Stock Alerts */}
          {/* {stockAlerts && stockAlerts.length > 0 && (
            <Card className="mb-6 border-l-4 border-(--md-sys-color-error)">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-(--md-sys-color-error) mb-3">
                  <span className="mdi text-lg mr-2">warning</span>
                  {t('stock.stockAlerts')} ({stockAlerts.length})
                </h3>
                <div className="space-y-2">
                  {stockAlerts.slice(0, 3).map((alert: StockAlert) => (
                    <div key={alert.id} className="flex justify-between items-center p-2 bg-(--md-sys-color-error-container) rounded">
                      <div>
                        <span className="font-medium">{alert.productName}</span>
                        <span className="text-sm text-(--md-sys-color-on-surface-variant) ml-2">
                          {t('stock.current')}: {alert.currentStock}, {t('stock.threshold')}: {alert.threshold}
                        </span>
                      </div>
                      <Button
                        variant="text"
                        label={t('stock.acknowledge')}
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                        disabled={acknowledgeAlert.isPending}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )} */}

          {/* Filters */}
          {showFilters && (
            <Card className="mb-6">
              <div className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <TextField
                      label={t('stock.searchProducts')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t('stock.searchProductsPlaceholder')}
                    />
                  </div>
                  <div className="w-full sm:w-48">
                    <Select
                      label={t('stock.stockStatus')}
                      value={statusFilter}
                      onChange={(value) => setStatusFilter(value)}
                      options={[
                        { value: 'all', label: t('stock.allItems') },
                        { value: 'low', label: t('stock.lowStockItems') },
                        { value: 'out', label: t('stock.outOfStockItems') },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Stock Items List */}
          {isError ? (
            <Card variant="outlined" className="text-center py-12">
              <div className="flex flex-col items-center justify-center">
                <span className="mdi text-4xl text-(--md-sys-color-error) mb-4">error</span>
                <p className="text-(--md-sys-color-error) mb-4">{t('stock.failedToLoad')}</p>
                <Button 
                  variant="filled"
                  onClick={() => refetch()}
                  label={t('actions.retry')}
                  hasIcon
                  icon="refresh"
                />
              </div>
            </Card>
          ) : stockItems.length === 0 ? (
            <Card variant="outlined" className="text-center py-12">
              <div className="flex flex-col items-center justify-center">
                <span className="mdi text-4xl text-(--md-sys-color-on-surface-variant) mb-4">inventory</span>
                <p className="text-(--md-sys-color-on-surface-variant)">
                  {searchTerm ? t('stock.noStockItemsSearch') : t('stock.noStockItems')}
                </p>
              </div>
            </Card>
          ) : (
            <Card variant="elevated">
              <List>
                {stockItems.map((item: StockItem) => {
                  const status = getStockStatus(item);
                  return (
                    <ListItem
                      key={item.id}
                      leading={
                        <div className="h-12 w-12 rounded-lg bg-(--md-sys-color-surface-container-highest) flex items-center justify-center overflow-hidden">
                          {item.productImage ? (
                            <img 
                              src={item.productImage} 
                              alt={item.productName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-(--md-sys-color-on-surface-variant) text-lg mdi">inventory_2</span>
                          )}
                        </div>
                      }
                      trailing={
                        <div className="flex items-center gap-2">
                          <Chip
                            variant="assist"
                            color={getStockStatusColor(status)}
                            label={getStockStatusLabel(status)}
                            selected
                          />
                          {showActions && (
                            <Button
                              variant="text"
                              hasIcon
                              icon="tune"
                              label={t('actions.adjust')}
                              onClick={() => {
                                setSelectedItem(item);
                                setIsAdjustingStock(true);
                              }}
                            />
                          )}
                        </div>
                      }
                      supportingText={
                        `${t('stock.available')}: ${item.availableStock} • ${t('stock.reserved')}: ${item.reservedStock} • ${t('stock.minLevel')}: ${item.minStockLevel} • ${t('stock.category')}: ${item.categoryName} • ${t('stock.value')}: ${formatVND(item.availableStock * item.unitCost)}`
                      }
                    >
                      <div className="font-medium text-(--md-sys-color-on-surface)">
                        {item.productName}
                      </div>
                    </ListItem>
                  );
                })}
              </List>
              
              {/* Pagination */}
              {stockData && (
                <div className="p-4 border-t border-(--md-sys-color-outline-variant)">
                  <Pagination
                    paginationInfo={pagination.paginationInfo}
                    controls={pagination.controls}
                  />
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {/* Stock Adjustment Modal */}
      {isAdjustingStock && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">{t('stock.adjustStock')}</h3>
              <p className="text-(--md-sys-color-on-surface-variant) mb-4">
                {selectedItem.productName}
              </p>
              <p className="text-sm text-(--md-sys-color-on-surface-variant) mb-4">
                {t('stock.currentStock')}: {selectedItem.availableStock}
              </p>

              <div className="space-y-4">
                <Select
                  label={t('stock.adjustmentType')}
                  value={adjustmentType}
                  onChange={(value) => setAdjustmentType(value as StockMovementType)}
                  options={Object.entries(StockMovementTypeLabels).map(([value, label]) => ({
                    value,
                    label
                  }))}
                />

                <TextField
                  label={t('stock.quantity')}
                  type="number"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(e.target.value)}
                  placeholder={t('form.placeholder.quantity')}
                  required
                />

                <TextField
                  label={t('stock.reason')}
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder={t('stock.reasonPlaceholder')}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outlined"
                  label={t('actions.cancel')}
                  onClick={() => {
                    setIsAdjustingStock(false);
                    setSelectedItem(null);
                  }}
                />
                <Button
                  variant="filled"
                  label={adjustStock.isPending ? t('stock.processing') : t('stock.adjustStock')}
                  onClick={handleStockAdjustment}
                  disabled={adjustStock.isPending || !adjustmentQuantity || !adjustmentReason}
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add Stock Form Modal */}
      {showAddStockForm && (
        <AddStockForm
          onCancel={() => setShowAddStockForm(false)}
          onStockAdded={handleStockAdded}
        />
      )}

      {/* Bulk Update Modal */}
      {showBulkUpdate && (
        <BulkStockUpdate
          onClose={() => {
            setShowBulkUpdate(false);
            refetch();
          }}
        />
      )}

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
