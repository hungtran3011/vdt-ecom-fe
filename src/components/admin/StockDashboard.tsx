'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Select from '@/components/Select';
import Chip from '@/components/Chip';
import { List, ListItem } from '@/components/List';
import StockMovementHistory from './StockMovementHistory';
import { 
  useStockSummary, 
  useStockAlerts, 
  useStockItems,
  useAcknowledgeAlert 
} from '@/hooks/useStock';
import { useSnackbar } from '@/hooks/useSnackbar';
import { StockAlert, StockItem } from '@/types/Stock';
import { formatVND } from '@/utils/currency';
import { t } from '@/utils/localization';

interface StockDashboardProps {
  className?: string;
}

export default function StockDashboard({ className = '' }: StockDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedView, setSelectedView] = useState<'overview' | 'alerts' | 'movements' | 'low-stock'>('overview');

  // Snackbar for notifications
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  // TanStack Query hooks
  const { data: stockSummary } = useStockSummary();
  const { data: stockAlerts } = useStockAlerts({ acknowledged: false });
  const { data: lowStockItems } = useStockItems({ lowStock: true, size: 10 });
  const acknowledgeAlert = useAcknowledgeAlert();

  const handleAcknowledgeAlert = async (alertId: number) => {
    try {
      await acknowledgeAlert.mutateAsync(alertId);
      showSnackbar(t('stock.alertAcknowledged'), 'success');
    } catch (error) {
      showSnackbar(t('stock.failedToAcknowledgeAlert'), 'error');
      console.error('Alert acknowledgment error:', error);
    }
  };

  const timeRangeOptions = [
    { value: '1d', label: t('time.today') },
    { value: '7d', label: t('time.last7Days') },
    { value: '30d', label: t('time.last30Days') },
    { value: '90d', label: t('time.last90Days') }
  ];

  const viewOptions = [
    { value: 'overview', label: t('stock.overview') },
    { value: 'alerts', label: t('stock.alerts') },
    { value: 'movements', label: t('stock.recentMovements') },
    { value: 'low-stock', label: t('stock.lowStock') }
  ];

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">{t('stock.dashboard')}</h1>
          <p className="text-on-surface-variant mt-1">
            {t('stock.dashboardDescription')}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select
            label={t('time.timeRange')}
            value={selectedTimeRange}
            onChange={setSelectedTimeRange}
            options={timeRangeOptions}
          />
          <Select
            label={t('stock.view')}
            value={selectedView}
            onChange={(value) => setSelectedView(value as typeof selectedView)}
            options={viewOptions}
          />
        </div>
      </div>

      {/* Summary Cards */}
      {stockSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-primary mb-1">
                  {stockSummary.totalProducts}
                </div>
                <div className="text-sm text-on-surface-variant">{t('stats.totalProducts')}</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary-container flex items-center justify-center">
                <span className="mdi text-lg text-primary">inventory_2</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-primary mb-1">
                  {formatVND(stockSummary.totalStockValue)}
                </div>
                <div className="text-sm text-on-surface-variant">{t('stock.totalValue')}</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary-container flex items-center justify-center">
                <span className="mdi text-lg text-primary">attach_money</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-error mb-1">
                  {stockSummary.lowStockItems}
                </div>
                <div className="text-sm text-on-surface-variant">{t('stock.lowStockItems')}</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-error-container flex items-center justify-center">
                <span className="mdi text-lg text-error">warning</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-error mb-1">
                  {stockSummary.outOfStockItems}
                </div>
                <div className="text-sm text-on-surface-variant">{t('stock.outOfStockItems')}</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-error-container flex items-center justify-center">
                <span className="mdi text-lg text-error">remove_shopping_cart</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Dynamic Content Based on Selected View */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Alerts */}
          <Card>
            <div className="p-4 border-b border-outline-variant">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-on-surface">{t('stock.recentAlerts')}</h3>
                <Button
                  variant="text"
                  label={t('actions.viewAll')}
                  onClick={() => setSelectedView('alerts')}
                />
              </div>
            </div>
            <div className="p-4">
              {stockAlerts && stockAlerts.length > 0 ? (
                <div className="space-y-3">
                  {stockAlerts.slice(0, 5).map((alert: StockAlert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-error-container rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="mdi text-error">warning</span>
                        <div>
                          <div className="font-medium text-on-surface">{alert.productName}</div>
                          <div className="text-sm text-on-surface-variant">
                            {t('stock.currentStock')}: {alert.currentStock} | {t('stock.threshold')}: {alert.threshold}
                          </div>
                        </div>
                      </div>
                      <Chip
                        variant="assist"
                        color="error"
                        label={alert.severity}
                        selected
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-on-surface-variant">
                  <span className="mdi text-4xl mb-2 block">check_circle</span>
                  {t('stock.noActiveAlerts')}
                </div>
              )}
            </div>
          </Card>

          {/* Low Stock Items */}
          <Card>
            <div className="p-4 border-b border-outline-variant">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-on-surface">{t('stock.lowStockItems')}</h3>
                <Button
                  variant="text"
                  label={t('actions.viewAll')}
                  onClick={() => setSelectedView('low-stock')}
                />
              </div>
            </div>
            <div className="p-4">
              {lowStockItems?.data && lowStockItems.data.length > 0 ? (
                <List>
                  {lowStockItems.data.slice(0, 5).map((item: StockItem) => (
                    <ListItem
                      key={item.id}
                      leading={
                        <div className="h-10 w-10 rounded-lg bg-surface-container-highest flex items-center justify-center overflow-hidden">
                          {item.productImage ? (
                            <img 
                              src={item.productImage} 
                              alt={item.productName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-on-surface-variant text-sm mdi">inventory_2</span>
                          )}
                        </div>
                      }
                      trailing={
                        <Chip
                          variant="assist"
                          color="tertiary"
                          label={`${item.availableStock}/${item.minStockLevel}`}
                          selected
                        />
                      }
                      supportingText={`${t('stock.category')}: ${item.categoryName}`}
                    >
                      <div className="font-medium text-on-surface">{item.productName}</div>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <div className="text-center py-8 text-on-surface-variant">
                  <span className="mdi text-4xl mb-2 block">inventory_2</span>
                  {t('stock.noLowStockItems')}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Alerts View */}
      {selectedView === 'alerts' && (
        <Card>
          <div className="p-4 border-b border-outline-variant">
            <h3 className="text-lg font-semibold text-on-surface">{t('stock.stockAlerts')}</h3>
          </div>
          <div className="p-4">
            {stockAlerts && stockAlerts.length > 0 ? (
              <div className="space-y-4">
                {stockAlerts.map((alert: StockAlert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border border-outline-variant rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        alert.severity === 'CRITICAL' ? 'bg-error-container' :
                        alert.severity === 'HIGH' ? 'bg-error-container' :
                        alert.severity === 'MEDIUM' ? 'bg-tertiary-container' : 
                        'bg-secondary-container'
                      }`}>
                        <span className={`mdi text-lg ${
                          alert.severity === 'CRITICAL' ? 'text-error' :
                          alert.severity === 'HIGH' ? 'text-error' :
                          alert.severity === 'MEDIUM' ? 'text-tertiary' : 
                          'text-secondary'
                        }`}>warning</span>
                      </div>
                      <div>
                        <div className="font-medium text-on-surface">{alert.productName}</div>
                        <div className="text-sm text-on-surface-variant">
                          {t('stock.currentStock')}: {alert.currentStock} | {t('stock.threshold')}: {alert.threshold}
                        </div>
                        <div className="text-xs text-on-surface-variant mt-1">
                          {new Date(alert.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Chip
                        variant="assist"
                        color={alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? 'error' : 'tertiary'}
                        label={alert.severity}
                        selected
                      />
                      <Button
                        variant="text"
                        label={t('stock.acknowledge')}
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                        disabled={acknowledgeAlert.isPending}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-on-surface-variant">
                <span className="mdi text-4xl mb-4 block">check_circle</span>
                {t('stock.noActiveAlerts')}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Movements View */}
      {selectedView === 'movements' && (
        <StockMovementHistory className="w-full" />
      )}

      {/* Low Stock View */}
      {selectedView === 'low-stock' && (
        <Card>
          <div className="p-4 border-b border-outline-variant">
            <h3 className="text-lg font-semibold text-on-surface">{t('stock.lowStockItems')}</h3>
          </div>
          <div className="p-4">
            {lowStockItems?.data && lowStockItems.data.length > 0 ? (
              <List>
                {lowStockItems.data.map((item: StockItem) => (
                  <ListItem
                    key={item.id}
                    leading={
                      <div className="h-12 w-12 rounded-lg bg-surface-container-highest flex items-center justify-center overflow-hidden">
                        {item.productImage ? (
                          <img 
                            src={item.productImage} 
                            alt={item.productName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-on-surface-variant text-lg mdi">inventory_2</span>
                        )}
                      </div>
                    }
                    trailing={
                      <div className="text-right">
                        <Chip
                          variant="assist"
                          color="tertiary"
                          label={`${item.availableStock}/${item.minStockLevel}`}
                          selected
                        />
                        <div className="text-xs text-on-surface-variant mt-1">
                          {formatVND(item.availableStock * item.unitCost)}
                        </div>
                      </div>
                    }
                    supportingText={
                      `${t('stock.category')}: ${item.categoryName} • ${t('stock.reserved')}: ${item.reservedStock} • ${t('stock.unitCost')}: ${formatVND(item.unitCost)}`
                    }
                  >
                    <div className="font-medium text-on-surface">{item.productName}</div>
                  </ListItem>
                ))}
              </List>
            ) : (
              <div className="text-center py-12 text-on-surface-variant">
                <span className="mdi text-4xl mb-4 block">inventory_2</span>
                {t('stock.noLowStockItems')}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Snackbar */}
      {snackbar.isOpen && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <div className={`p-4 rounded-lg text-white ${
            snackbar.severity === 'error' ? 'bg-error' : 
            snackbar.severity === 'success' ? 'bg-primary' : 
            'bg-secondary'
          }`}>
            <div className="flex items-center justify-between">
              <span>{snackbar.message}</span>
              <Button
                variant="text"
                hasIcon
                icon="close"
                onClick={hideSnackbar}
                className="text-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
