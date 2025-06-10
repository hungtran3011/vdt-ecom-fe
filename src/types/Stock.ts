// Stock Management Types
export interface ProductVariation {
  id: number;
  name: string;
  values: string[];
}

export interface StockItem {
  id: number;
  sku: string;
  productId: number;
  productName: string;
  productImage?: string;
  categoryName: string;
  variations?: ProductVariation[];
  quantity: number;
  lowStockThreshold: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  // Legacy fields for backward compatibility
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minStockLevel: number;
  maxStockLevel?: number;
  unitCost: number;
  totalValue: number;
  lastRestockDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  type: StockMovementType;
  quantity: number;
  reason: string;
  reference?: string; // Order ID, Purchase Order, etc.
  userId: string;
  userName: string;
  createdAt: Date;
}

export enum StockMovementType {
  IN = 'IN',           // Stock added
  OUT = 'OUT',         // Stock removed
  RESERVED = 'RESERVED', // Stock reserved for order
  RELEASED = 'RELEASED', // Reserved stock released
  ADJUSTMENT = 'ADJUSTMENT', // Manual adjustment
  DAMAGED = 'DAMAGED',   // Damaged/expired stock
  RETURNED = 'RETURNED'  // Customer return
}

export const StockMovementTypeLabels: Record<StockMovementType, string> = {
  [StockMovementType.IN]: 'Stock In',
  [StockMovementType.OUT]: 'Stock Out',
  [StockMovementType.RESERVED]: 'Reserved',
  [StockMovementType.RELEASED]: 'Released',
  [StockMovementType.ADJUSTMENT]: 'Adjustment',
  [StockMovementType.DAMAGED]: 'Damaged',
  [StockMovementType.RETURNED]: 'Returned'
};

export interface StockAlert {
  id: number;
  productId: number;
  productName: string;
  type: StockAlertType;
  currentStock: number;
  threshold: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  acknowledged: boolean;
  createdAt: Date;
}

export enum StockAlertType {
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  OVERSTOCK = 'OVERSTOCK',
  EXPIRED = 'EXPIRED'
}

export interface CreateStockMovementRequest {
  productId: number;
  type: StockMovementType;
  quantity: number;
  reason: string;
  reference?: string;
}

export interface UpdateStockRequest {
  productId: number;
  quantity: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  unitCost?: number;
}

export interface CreateStockRequest {
  sku: string;
  productId: number;
  variations?: {
    id: number;
    name: string;
    values: string[];
  }[];
  quantity: number;
  lowStockThreshold?: number;
}

export interface StockSummary {
  totalProducts: number;
  totalStockValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  recentMovements: number;
}

export interface StockManagementProps {
  title?: string;
  className?: string;
  showFilters?: boolean;
  showActions?: boolean;
}
