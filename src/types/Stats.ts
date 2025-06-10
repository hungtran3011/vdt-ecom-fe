export interface SystemStatsDto {
  generatedAt: string;
  systemStatus: string;
  productStats: ProductStatsDto;
  orderStats: OrderStatsDto;
  paymentStats: PaymentStatsDto;
  userActivityStats: UserActivityStatsDto;
  stockStats: StockStatsDto;
  cartStats: CartStatsDto;
  performanceStats: PerformanceStatsDto;
  categoryStats: CategoryStatsDto;
}

export interface ProductStatsDto {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  totalCategories: number;
  averageProductPrice: number;
  mostExpensiveProduct: number;
  cheapestProduct: number;
  productsAddedToday: number;
  productsAddedThisWeek: number;
  productsAddedThisMonth: number;
  topSellingProducts: ProductSalesInfo[];
  lowPerformingProducts: ProductSalesInfo[];
}

export interface ProductSalesInfo {
  productId: number;
  productName: string;
  totalSold: number;
  revenue: number;
}

export interface OrderStatsDto {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  topCustomers: CustomerOrderInfo[];
  ordersByStatus: { [status: string]: number };
  dailyOrderTrends: DailySalesData[];
  monthlyRevenueTrends: MonthlySalesData[];
}

export interface CustomerOrderInfo {
  userId: string;
  userName: string;
  totalOrders: number;
  totalSpent: number;
}

export interface DailySalesData {
  date: string;
  orders: number;
  revenue: number;
}

export interface MonthlySalesData {
  month: string;
  orders: number;
  revenue: number;
}

export interface PaymentStatsDto {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  refundedPayments: number;
  totalPaymentVolume: number;
  successRate: number;
  averagePaymentAmount: number;
  paymentMethodBreakdown: { [method: string]: number };
  paymentStatusBreakdown: { [status: string]: number };
  dailyPaymentVolumes: DailyPaymentData[];
  refundRate: number;
  totalRefundAmount: number;
}

export interface DailyPaymentData {
  date: string;
  volume: number;
  transactions: number;
  successRate: number;
}

export interface UserActivityStatsDto {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByRole: { [role: string]: number };
  profileCompletionRate: number;
  usersWithProfiles: number;
  averageOrdersPerUser: number;
  userRegistrationTrends: UserRegistrationData[];
}

export interface UserRegistrationData {
  date: string;
  registrations: number;
}

export interface StockStatsDto {
  totalStockItems: number;
  inStockItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalStockValue: number;
  averageStockLevel: number;
  stockMovementsToday: number;
  stockMovementsThisWeek: number;
  stockMovementsThisMonth: number;
  criticalStockAlerts: number;
  lowStockProducts: LowStockProduct[];
  stockTurnoverRate: number;
}

export interface LowStockProduct {
  productId: number;
  productName: string;
  currentStock: number;
  threshold: number;
  sku: string;
}

export interface CartStatsDto {
  totalCarts: number;
  activeCarts: number;
  abandonedCarts: number;
  averageCartValue: number;
  totalCartValue: number;
  cartAbandonmentRate: number;
  averageItemsPerCart: number;
  cartsCreatedToday: number;
  cartsCreatedThisWeek: number;
  cartsCreatedThisMonth: number;
  conversionRate: number;
}

export interface PerformanceStatsDto {
  systemUptime: string;
  averageResponseTime: number;
  totalApiCalls: number;
  errorRate: number;
  peakConcurrentUsers: number;
  databaseConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  networkLatency: number;
}

export interface CategoryStatsDto {
  totalCategories: number;
  categoriesWithProducts: number;
  emptCategories: number;
  averageProductsPerCategory: number;
  topPerformingCategories: CategoryPerformance[];
  categoryProductDistribution: { [categoryName: string]: number };
}

export interface CategoryPerformance {
  categoryId: number;
  categoryName: string;
  productCount: number;
  totalRevenue: number;
  totalOrders: number;
}

// Legacy interface for backward compatibility
export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalStockValue: number;
  lowStockProducts: number;
  pendingOrders: number;
  completedOrders: number;
}