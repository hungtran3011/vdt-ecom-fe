'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import Select from '@/components/Select';
import Chip, { ChipColor } from '@/components/Chip';
import { List, ListItem } from '@/components/List';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { useStockMovements } from '@/hooks/useStock';
import { StockMovement, StockMovementType, StockMovementTypeLabels } from '@/types/Stock';
import { t } from '@/utils/localization';

interface StockMovementHistoryProps {
  productId?: number;
  className?: string;
}

export default function StockMovementHistory({ productId, className = '' }: StockMovementHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination state
  const pagination = usePagination();

  // TanStack Query hook
  const {
    data: movementsData,
    isLoading,
    isError,
    refetch
  } = useStockMovements({
    page: pagination.paginationParams.page,
    size: pagination.paginationParams.size,
    cursor: pagination.paginationParams.cursor,
    productId: productId,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined
  });

  const movements = movementsData?.data || [];

  const getMovementTypeColor = (type: StockMovementType): ChipColor => {
    switch (type) {
      case StockMovementType.IN:
      case StockMovementType.RETURNED:
        return 'primary';
      case StockMovementType.OUT:
      case StockMovementType.DAMAGED:
        return 'error';
      case StockMovementType.RESERVED:
        return 'tertiary';
      case StockMovementType.RELEASED:
        return 'secondary';
      case StockMovementType.ADJUSTMENT:
        return 'primary';
      default:
        return 'primary';
    }
  };

  const getMovementIcon = (type: StockMovementType): string => {
    switch (type) {
      case StockMovementType.IN:
        return 'add_circle';
      case StockMovementType.OUT:
        return 'remove_circle';
      case StockMovementType.RESERVED:
        return 'lock';
      case StockMovementType.RELEASED:
        return 'lock_open';
      case StockMovementType.ADJUSTMENT:
        return 'tune';
      case StockMovementType.DAMAGED:
        return 'warning';
      case StockMovementType.RETURNED:
        return 'undo';
      default:
        return 'circle';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-on-surface">
            {productId ? t('stock.productMovementHistory') : t('stock.stockMovementHistory')}
          </h2>
          <p className="text-on-surface-variant mt-1">
            {t('stock.viewDetailedMovementHistory')}
          </p>
        </div>
        
        <Button
          variant="outlined"
          hasIcon
          icon="refresh"
          label={t('actions.refresh')}
          onClick={() => refetch()}
          disabled={isLoading}
        />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label={t('stock.movementType')}
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'all', label: t('stock.allTypes') },
                ...Object.entries(StockMovementTypeLabels).map(([value, label]) => ({
                  value,
                  label
                }))
              ]}
            />
            <TextField
              label={t('stock.startDate')}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <TextField
              label={t('stock.endDate')}
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <TextField
              label={t('stock.searchReference')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('stock.searchReferencePlaceholder')}
            />
          </div>
        </div>
      </Card>

      {/* Movement History List */}
      {isError ? (
        <Card variant="outlined" className="text-center py-12">
          <div className="flex flex-col items-center justify-center">
            <span className="mdi text-4xl text-error mb-4">error</span>
            <p className="text-error mb-4">{t('stock.failedToLoadHistory')}</p>
            <Button 
              variant="filled"
              onClick={() => refetch()}
              label={t('actions.retry')}
              hasIcon
              icon="refresh"
            />
          </div>
        </Card>
      ) : movements.length === 0 ? (
        <Card variant="outlined" className="text-center py-12">
          <div className="flex flex-col items-center justify-center">
            <span className="mdi text-4xl text-on-surface-variant mb-4">history</span>
            <p className="text-on-surface-variant">
              {t('stock.noMovementHistory')}
            </p>
          </div>
        </Card>
      ) : (
        <Card variant="elevated">
          <List>
            {movements.map((movement: StockMovement) => (
              <ListItem
                key={movement.id}
                leading={
                  <div className="h-12 w-12 rounded-full bg-surface-container-highest flex items-center justify-center">
                    <span className={`mdi text-lg ${getMovementTypeColor(movement.type)}`}>
                      {getMovementIcon(movement.type)}
                    </span>
                  </div>
                }
                trailing={
                  <div className="text-right">
                    <div className="text-sm font-medium text-on-surface">
                      {movement.type === StockMovementType.OUT || 
                       movement.type === StockMovementType.RESERVED ||
                       movement.type === StockMovementType.DAMAGED ? '-' : '+'}
                      {movement.quantity}
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      {formatDate(movement.createdAt)}
                    </div>
                  </div>
                }
              >
                <div className="space-y-2">
                  <div className="font-medium text-on-surface">
                    {!productId && movement.productName}
                    {productId && `${t('stock.movement')} #${movement.id}`}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Chip
                        variant="assist"
                        color={getMovementTypeColor(movement.type)}
                        label={StockMovementTypeLabels[movement.type]}
                        selected
                      />
                      {movement.reference && (
                        <span className="text-xs text-on-surface-variant">
                          {t('stock.referenceShort')}: {movement.reference}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      {movement.reason}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {t('stock.performedBy')}: {movement.userName}
                    </p>
                  </div>
                </div>
              </ListItem>
            ))}
          </List>
          
          {/* Pagination */}
          {movementsData && (
            <div className="p-4 border-t border-outline-variant">
              <Pagination
                paginationInfo={pagination.paginationInfo}
                controls={pagination.controls}
              />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
