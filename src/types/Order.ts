export enum OrderStatus {
    PENDING_PAYMENT = "PENDING_PAYMENT",
    PAID = "PAID",
    CONFIRMED = "CONFIRMED",
    PROCESSING = "PROCESSING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    PAYMENT_FAILED = "PAYMENT_FAILED"
}

export const OrderStatusLabels: Record<OrderStatus, string> = {
    [OrderStatus.PENDING_PAYMENT]: "Chờ thanh toán",
    [OrderStatus.PAID]: "Đã thanh toán",
    [OrderStatus.CONFIRMED]: "Đã xác nhận",
    [OrderStatus.PROCESSING]: "Đang xử lý",
    [OrderStatus.SHIPPED]: "Đang giao hàng",
    [OrderStatus.DELIVERED]: "Đã giao hàng",
    [OrderStatus.CANCELLED]: "Đã hủy",
    [OrderStatus.PAYMENT_FAILED]: "Thanh toán thất bại"
};

export enum PaymentMethod {
    CASH_ON_DELIVERY = "CASH_ON_DELIVERY",
    CREDIT_CARD = "CREDIT_CARD",
    VIETTEL_MONEY = "VIETTEL_MONEY"
}

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
    [PaymentMethod.CASH_ON_DELIVERY]: "Thanh toán khi nhận hàng",
    [PaymentMethod.CREDIT_CARD]: "Thẻ tín dụng",
    [PaymentMethod.VIETTEL_MONEY]: "Viettel Money"
};

export enum PaymentStatus {
    PENDING = "PENDING",
    SUCCESSFUL = "SUCCESSFUL",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}

export type Order = {
    id: string;
    userEmail: string;
    status: OrderStatus;
    address: string;
    phone: string;
    note: string;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    paymentId: string;
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
    items: OrderItem[];
}

export type OrderItem = {
    id?: number; // Optional for creation, set by backend
    orderId?: string; // Optional for creation, set by backend
    productId: number;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
    totalPrice: number;
}

// Additional types for API integration
export type CreateOrderRequest = {
    userEmail?: string;
    status?: OrderStatus;
    address: string;
    phone: string;
    note?: string;
    paymentMethod: PaymentMethod;
    paymentStatus?: PaymentStatus;
    paymentId?: string;
    totalPrice: number;
    items: CreateOrderItem[];
}

export type CreateOrderItem = {
    productId: number;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
    totalPrice: number;
}

// DTO type that matches backend response exactly
export type OrderDto = {
    id: string;
    userEmail: string;
    status: OrderStatus;
    address: string;
    phone: string;
    note: string;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    paymentId: string;
    totalPrice: number; // BigDecimal from backend comes as number in JSON
    createdAt: string; // ISO date string from backend
    updatedAt: string; // ISO date string from backend
    items: OrderItemDto[];
}

export type OrderItemDto = {
    id: number; // Long from backend comes as number in JSON
    orderId: string;
    productId: number; // Long from backend comes as number in JSON
    productName: string;
    productImage: string;
    quantity: number; // Integer from backend comes as number in JSON
    price: number; // BigDecimal from backend comes as number in JSON
    totalPrice: number; // BigDecimal from backend comes as number in JSON
}

