// Enhanced Payment Management Types
export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerId?: string;
  transactionId?: string;
  reference?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  failureReason?: string;
  refundedAmount?: number;
  refundReason?: string;
  processedAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentMethod {
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  VIETTEL_MONEY = 'VIETTEL_MONEY',
  MOMO = 'MOMO',
  ZALOPAY = 'ZALOPAY',
  VNPAY = 'VNPAY'
}

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH_ON_DELIVERY]: 'Thanh toán khi nhận hàng',
  [PaymentMethod.CREDIT_CARD]: 'Thẻ tín dụng',
  [PaymentMethod.DEBIT_CARD]: 'Thẻ ghi nợ',
  [PaymentMethod.BANK_TRANSFER]: 'Chuyển khoản ngân hàng',
  [PaymentMethod.VIETTEL_MONEY]: 'Viettel Money',
  [PaymentMethod.MOMO]: 'MoMo',
  [PaymentMethod.ZALOPAY]: 'ZaloPay',
  [PaymentMethod.VNPAY]: 'VNPay'
};

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  EXPIRED = 'EXPIRED'
}

export const PaymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Chờ xử lý',
  [PaymentStatus.PROCESSING]: 'Đang xử lý',
  [PaymentStatus.SUCCESSFUL]: 'Thành công',
  [PaymentStatus.FAILED]: 'Thất bại',
  [PaymentStatus.CANCELLED]: 'Đã hủy',
  [PaymentStatus.REFUNDED]: 'Đã hoàn tiền',
  [PaymentStatus.PARTIALLY_REFUNDED]: 'Hoàn tiền một phần',
  [PaymentStatus.EXPIRED]: 'Hết hạn'
};

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  VIETTEL_MONEY = 'VIETTEL_MONEY',
  MOMO = 'MOMO',
  ZALOPAY = 'ZALOPAY',
  VNPAY = 'VNPAY',
  CASH = 'CASH'
}

export interface PaymentSummary {
  totalPayments: number;
  totalAmount: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  refundedAmount: number;
  averageTransactionValue: number;
}

export interface PaymentAnalytics {
  dailyRevenue: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
  methodDistribution: Array<{
    method: PaymentMethod;
    count: number;
    amount: number;
    percentage: number;
  }>;
  statusDistribution: Array<{
    status: PaymentStatus;
    count: number;
    percentage: number;
  }>;
}

export interface RefundRequest {
  paymentId: string;
  amount: number;
  reason: string;
  notifyCustomer?: boolean;
}

export interface ProcessPaymentRequest {
  paymentId: string;
  action: 'APPROVE' | 'REJECT' | 'REFUND';
  reason?: string;
  amount?: number;
}

export interface PaymentManagementProps {
  title?: string;
  className?: string;
  showFilters?: boolean;
  showActions?: boolean;
  showAnalytics?: boolean;
}
