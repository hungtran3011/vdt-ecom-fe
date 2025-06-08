export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  // Stock metrics
  totalStockValue: number;
  lowStockAlerts: number;
  outOfStockItems: number;
  // Payment metrics
  pendingPayments: number;
  completedPayments: number;
  refundedPayments: number;
  totalPaymentVolume: number;
}
