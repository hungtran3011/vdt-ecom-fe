export enum OrderStatus {
    PENDING_PAYMENT,
    PAID,
    CONFIRMED,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED,
    PAYMENT_FAILED
}

export const OrderStatusLabels: Record<OrderStatus, string> = {
    [OrderStatus.PENDING_PAYMENT]: "Chờ thanh toán",
    [OrderStatus.PAID]: "Đã thanh toán",
    [OrderStatus.CONFIRMED]: "Đã xác nhận",
    [OrderStatus.PROCESSING]: "Đang xử lý",
    [OrderStatus.SHIPPED]: "Đã giao vận",
    [OrderStatus.DELIVERED]: "Đã giao hàng",
    [OrderStatus.CANCELLED]: "Đã hủy",
    [OrderStatus.PAYMENT_FAILED]: "Thanh toán thất bại"
};

export enum PaymentMethod {
    CASH_ON_DELIVERY,
    CREDIT_CARD,
    VIETTEL_MONEY
}

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
    [PaymentMethod.CASH_ON_DELIVERY]: "Thanh toán khi nhận hàng",
    [PaymentMethod.CREDIT_CARD]: "Thẻ tín dụng",
    [PaymentMethod.VIETTEL_MONEY]: "Viettel Money"
};

export enum PaymentStatus {
    PENDING,
    SUCCESSFUL,
    FAILED,
    REFUNDED
}

export type Order = {
    id: string;
    userId: string;
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
    id: number;
    orderId: string;
    productId: number;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
    totalPrice: number;
}

