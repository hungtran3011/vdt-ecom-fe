'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import Select from '@/components/Select';
import Chip from '@/components/Chip';
import { List, ListItem } from '@/components/List';
import Snackbar from '@/components/Snackbar';
import Pagination from '@/components/Pagination';
import { 
  usePayments, 
  usePaymentSummary, 
  useProcessPayment,
  useCreateRefund,
  useExportPaymentReport
} from '@/hooks/usePayments';
import { useSnackbar } from '@/hooks/useSnackbar';
import { usePagination } from '@/hooks/usePagination';
import { 
  Payment, 
  PaymentStatus,
  PaymentMethod,
  PaymentStatusLabels,
  PaymentMethodLabels,
  PaymentManagementProps
} from '@/types/Payment';
import { 
  PaymentValidators, 
  formatApiError,
  validateStatusTransition 
} from '@/utils/validation';
import { formatVND } from '@/utils/currency';
import { t } from '@/utils/localization';

export default function PaymentManagement({ 
  title = "Quản lý thanh toán",
  className = "",
  showFilters = true,
  showActions = true,
  showAnalytics = true
}: PaymentManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Pagination state
  const pagination = usePagination();

  // Snackbar for notifications
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  // TanStack Query hooks
  const { 
    data: paymentsData, 
    isLoading, 
    isError, 
    refetch 
  } = usePayments({
    page: pagination.paginationParams.page,
    size: pagination.paginationParams.size,
    cursor: pagination.paginationParams.cursor,
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    method: methodFilter !== 'all' ? methodFilter : undefined
  });

  const { data: paymentSummary } = usePaymentSummary();

  const processPayment = useProcessPayment();
  const createRefund = useCreateRefund();
  const exportReport = useExportPaymentReport();

  const payments = paymentsData?.data || [];

  const getPaymentStatusColor = (status: PaymentStatus): 'primary' | 'secondary' | 'tertiary' | 'error' => {
    switch (status) {
      case PaymentStatus.SUCCESSFUL: return 'primary';
      case PaymentStatus.PENDING: 
      case PaymentStatus.PROCESSING: return 'secondary';
      case PaymentStatus.FAILED:
      case PaymentStatus.CANCELLED: return 'error';
      case PaymentStatus.REFUNDED:
      case PaymentStatus.PARTIALLY_REFUNDED: return 'tertiary';
      default: return 'primary';
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CREDIT_CARD:
      case PaymentMethod.DEBIT_CARD: return 'credit_card';
      case PaymentMethod.BANK_TRANSFER: return 'account_balance';
      case PaymentMethod.CASH_ON_DELIVERY: return 'local_shipping';
      default: return 'payments';
    }
  };

  const handleProcessPayment = async (action: 'APPROVE' | 'REJECT') => {
    if (!selectedPayment) return;

    // Validate status transition
    const transitionValidation = validateStatusTransition(
      selectedPayment.status,
      action === 'APPROVE' ? PaymentStatus.SUCCESSFUL : PaymentStatus.FAILED,
      'payment'
    );

    if (!transitionValidation.isValid) {
      showSnackbar(transitionValidation.error || 'Invalid status transition', 'error');
      return;
    }

    try {
      await processPayment.mutateAsync({
        paymentId: selectedPayment.id,
        action,
        reason: action === 'REJECT' ? 'Administrative action' : undefined
      });

      showSnackbar(`Payment ${action.toLowerCase()}ed successfully`, 'success');
      setIsProcessingPayment(false);
      setSelectedPayment(null);
    } catch (error) {
      const errorMessage = formatApiError(error);
      showSnackbar(`Failed to ${action.toLowerCase()} payment: ${errorMessage}`, 'error');
    }
  };

  const handleRefund = async () => {
    if (!selectedPayment || !refundAmount || !refundReason) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    // Clear previous validation errors
    setValidationErrors({});

    // Validate refund data
    const amountValidation = PaymentValidators.refund.amount.validate(parseFloat(refundAmount));
    const reasonValidation = PaymentValidators.refund.reason.validate(refundReason);

    const newErrors: Record<string, string[]> = {};
    if (!amountValidation.isValid) newErrors.amount = amountValidation.errors;
    if (!reasonValidation.isValid) newErrors.reason = reasonValidation.errors;

    // Business rule: Cannot refund more than original payment amount
    const refundAmountNum = parseFloat(refundAmount);
    if (refundAmountNum > selectedPayment.amount) {
      newErrors.amount = [...(newErrors.amount || []), 'Refund amount cannot exceed original payment amount'];
    }

    // Check if payment can be refunded
    const canRefund = [PaymentStatus.SUCCESSFUL, PaymentStatus.PARTIALLY_REFUNDED].includes(selectedPayment.status);
    if (!canRefund) {
      showSnackbar('This payment cannot be refunded in its current status', 'error');
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      showSnackbar('Please fix validation errors', 'error');
      return;
    }

    try {
      await createRefund.mutateAsync({
        paymentId: selectedPayment.id,
        amount: refundAmountNum,
        reason: refundReason,
        notifyCustomer: true
      });

      showSnackbar('Refund processed successfully', 'success');
      setIsRefunding(false);
      setSelectedPayment(null);
      setRefundAmount('');
      setRefundReason('');
      setValidationErrors({});
    } catch (error) {
      const errorMessage = formatApiError(error);
      showSnackbar(`Failed to process refund: ${errorMessage}`, 'error');
    }
  };

  const handleExportReport = async (format: 'csv' | 'xlsx') => {
    try {
      await exportReport.mutateAsync({
        format,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        method: methodFilter !== 'all' ? methodFilter : undefined
      });
      showSnackbar(`Payment report exported as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      const errorMessage = formatApiError(error);
      showSnackbar(`Failed to export report: ${errorMessage}`, 'error');
    }
  };

  const formatCurrency = (amount: number, currency = 'VND') => {
    if (currency === 'VND') {
      return formatVND(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-(--md-sys-color-on-surface)">{title}</h1>
          {paymentSummary && (
            <p className="text-(--md-sys-color-on-surface-variant) mt-1">
              {paymentSummary.totalPayments} payments • {formatCurrency(paymentSummary.totalAmount)} total
            </p>
          )}
        </div>
        
        {showActions && (
          <div className="flex gap-2">
            <Button
              variant="outlined"
              hasIcon
              icon="download"
              label={t('actions.export')} 
              onClick={() => handleExportReport('csv')}
              disabled={exportReport.isPending}
            />
            <Button
              variant="outlined"
              hasIcon
              icon="download"
              label={t('actions.exportExcel')}
              onClick={() => handleExportReport('xlsx')}
              disabled={exportReport.isPending}
            />
          </div>
        )}
      </div>

      {/* Analytics Cards */}
      {showAnalytics && paymentSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-2xl font-bold text-(--md-sys-color-primary)">
              {paymentSummary.totalPayments}
            </div>
            <div className="text-sm text-(--md-sys-color-on-surface-variant)">{t('payment.totalPayments')}</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-(--md-sys-color-primary)">
              {formatCurrency(paymentSummary.totalAmount)}
            </div>
            <div className="text-sm text-(--md-sys-color-on-surface-variant)">{t('payment.totalRevenue')}</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-(--md-sys-color-success)">
              {paymentSummary.successfulPayments}
            </div>
            <div className="text-sm text-(--md-sys-color-on-surface-variant)">{t('status.successful')}</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-(--md-sys-color-error)">
              {paymentSummary.failedPayments}
            </div>
            <div className="text-sm text-(--md-sys-color-on-surface-variant)">{t('status.failed')}</div>
          </Card>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <Card className="mb-6">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <TextField
                  label={t('form.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('payment.searchPlaceholder')}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  label={t('form.status')}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  options={[
                    { value: 'all', label: t('form.allStatuses') },
                    ...Object.entries(PaymentStatusLabels).map(([value, label]) => ({
                      value,
                      label
                    }))
                  ]}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  label={t('payment.method')}
                  value={methodFilter}
                  onChange={(value) => setMethodFilter(value)}
                  options={[
                    { value: 'all', label: t('form.allMethods') },
                    ...Object.entries(PaymentMethodLabels).map(([value, label]) => ({
                      value,
                      label
                    }))
                  ]}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Payments List */}
      {isLoading ? (
        <Card variant="outlined" className="text-center py-12">
          <div className="flex flex-col items-center justify-center">
            <span className="mdi mdi-loading text-4xl text-(--md-sys-color-primary) mb-4 animate-spin"></span>
            <p className="text-(--md-sys-color-on-surface-variant)">Đang tải thanh toán...</p>
          </div>
        </Card>
      ) : isError ? (
        <Card variant="outlined" className="text-center py-12">
          <div className="flex flex-col items-center justify-center">
            <span className="mdi text-4xl text-(--md-sys-color-error) mb-4">error</span>
            <p className="text-(--md-sys-color-error) mb-4">Không thể tải dữ liệu thanh toán</p>
            <Button 
              variant="filled"
              onClick={() => refetch()}
              label={t('actions.retry')}
              hasIcon
              icon="refresh"
            />
          </div>
        </Card>
      ) : payments.length === 0 ? (
        <Card variant="outlined" className="text-center py-12">
          <div className="flex flex-col items-center justify-center">
            <span className="mdi text-4xl text-(--md-sys-color-on-surface-variant) mb-4">payments</span>
            <p className="text-(--md-sys-color-on-surface-variant)">
              {searchTerm ? t('messages.noPaymentsFound') : t('messages.noPaymentsAvailable')}
            </p>
          </div>
        </Card>
      ) : (
        <Card variant="elevated">
          <List>
            {payments.map((payment: Payment) => (
              <ListItem
                key={payment.id}
                leading={
                  <div className="h-12 w-12 rounded-lg bg-(--md-sys-color-surface-container-highest) flex items-center justify-center">
                    <span className={`mdi text-lg text-(--md-sys-color-primary) mdi-${getMethodIcon(payment.method)}`}>
                    </span>
                  </div>
                }
                trailing={
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(payment.amount, payment.currency)}</div>
                      <Chip
                        variant="assist"
                        color={getPaymentStatusColor(payment.status)}
                        label={PaymentStatusLabels[payment.status]}
                        selected
                      />
                    </div>
                    {showActions && (
                      <div className="flex gap-1">
                        {payment.status === PaymentStatus.PENDING && (
                          <Button
                            variant="text"
                            hasIcon
                            icon="check"
                            label={t('actions.process')}
                            onClick={() => {
                              setSelectedPayment(payment);
                              setIsProcessingPayment(true);
                            }}
                          />
                        )}
                        {payment.status === PaymentStatus.SUCCESSFUL && (
                          <Button
                            variant="text"
                            hasIcon
                            icon="undo"
                            label={t('actions.refund')}
                            onClick={() => {
                              setSelectedPayment(payment);
                              setIsRefunding(true);
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                }
                supportingText={`${t('order.order')}: ${payment.orderId} • ${t('payment.method')}: ${PaymentMethodLabels[payment.method]} • ${payment.userName} • ${new Date(payment.createdAt).toLocaleDateString('vi-VN')}${
                  payment.transactionId ? ` • TX: ${payment.transactionId.slice(0, 8)}...` : ''
                }`}
              >
                <div className="font-medium text-(--md-sys-color-on-surface)">
                  {t('payment.paymentId')} #{payment.id.slice(0, 8)}...
                </div>
              </ListItem>
            ))}
          </List>
          
          {/* Pagination */}
          {paymentsData && (
            <div className="p-4 border-t border-(--md-sys-color-outline-variant)">
              <Pagination
                paginationInfo={pagination.paginationInfo}
                controls={pagination.controls}
              />
            </div>
          )}
        </Card>
      )}

      {/* Process Payment Modal */}
      {isProcessingPayment && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">{t('payment.processPayment')}</h3>
              <p className="text-(--md-sys-color-on-surface-variant) mb-4">
                {t('payment.paymentId')} #{selectedPayment.id.slice(0, 8)}... • {formatCurrency(selectedPayment.amount)}
              </p>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outlined"
                  label={t('actions.cancel')}
                  onClick={() => {
                    setIsProcessingPayment(false);
                    setSelectedPayment(null);
                  }}
                />
                <Button
                  variant="outlined"
                  label={t('actions.reject')}
                  color="error"
                  onClick={() => handleProcessPayment('REJECT')}
                  disabled={processPayment.isPending}
                />
                <Button
                  variant="filled"
                  label={t('actions.approve')}
                  onClick={() => handleProcessPayment('APPROVE')}
                  disabled={processPayment.isPending}
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Refund Modal */}
      {isRefunding && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">{t('payment.processRefund')}</h3>
              <p className="text-(--md-sys-color-on-surface-variant) mb-4">
                {t('payment.paymentId')} #{selectedPayment.id.slice(0, 8)}... • {formatCurrency(selectedPayment.amount)}
              </p>

              <div className="space-y-4">
                <TextField
                  label={t('payment.refundAmount')}
                  type="number"
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => {
                    setRefundAmount(e.target.value);
                    // Clear amount validation errors on change
                    if (validationErrors.amount) {
                      const newErrors = { ...validationErrors };
                      delete newErrors.amount;
                      setValidationErrors(newErrors);
                    }
                  }}
                  placeholder={`Max: ${selectedPayment.amount}`}
                  required
                  error={validationErrors.amount?.[0]}
                />

                <TextField
                  label={t('payment.refundReason')}
                  value={refundReason}
                  onChange={(e) => {
                    setRefundReason(e.target.value);
                    // Clear reason validation errors on change
                    if (validationErrors.reason) {
                      const newErrors = { ...validationErrors };
                      delete newErrors.reason;
                      setValidationErrors(newErrors);
                    }
                  }}
                  placeholder={t('payment.refundReasonPlaceholder')}
                  required
                  error={validationErrors.reason?.[0]}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outlined"
                  label={t('actions.cancel')}
                  onClick={() => {
                    setIsRefunding(false);
                    setSelectedPayment(null);
                    setRefundAmount('');
                    setRefundReason('');
                    setValidationErrors({});
                  }}
                />
                <Button
                  variant="filled"
                  label={createRefund.isPending ? t('actions.processing') : t('payment.processRefund')}
                  onClick={handleRefund}
                  disabled={createRefund.isPending || !refundAmount || !refundReason}
                />
              </div>
            </div>
          </Card>
        </div>
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
