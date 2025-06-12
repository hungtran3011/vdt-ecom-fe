'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { OrderService } from '@/services/orderService';
import { formatVND } from '@/utils/currency';
import { Order, PaymentMethod } from '@/types/Order';

const CheckoutSuccessPage = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const message = searchParams.get('message');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Không tìm thấy mã đơn hàng');
        setLoading(false);
        return;
      }

      try {
        const orderService = new OrderService();
        const fetchedOrder = await orderService.getOrderById(orderId);
        setOrder(fetchedOrder);
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError('Không thể tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-(--md-sys-color-background) flex items-center justify-center p-4">
        <Card variant="elevated" className="max-w-md w-full p-8 text-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--md-sys-color-primary) mb-4"></div>
            <p className="text-(--md-sys-color-on-surface)">Đang tải thông tin đơn hàng...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-(--md-sys-color-background) flex items-center justify-center p-4">
        <Card variant="elevated" className="max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-(--md-sys-color-error-container) flex items-center justify-center">
            <span className="mdi text-4xl text-(--md-sys-color-on-error-container)">close</span>
          </div>
          <h1 className="text-2xl font-bold text-(--md-sys-color-on-surface) mb-4">Có lỗi xảy ra!</h1>
          <p className="text-(--md-sys-color-on-surface-variant) mb-8">{error}</p>
          <Link href="/checkout">
            <Button variant="filled" label="Quay lại đặt hàng" className="w-full" />
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--md-sys-color-background) p-4">
      <div className="max-w-4xl mx-auto">
        <Card variant="elevated" className="p-8">
          {/* Success Icon and Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-(--md-sys-color-tertiary-container) flex items-center justify-center">
              <span className="mdi text-5xl text-(--md-sys-color-on-tertiary-container)">check_circle</span>
            </div>
            
            <h1 className="text-3xl font-bold text-(--md-sys-color-on-surface) mb-4">
              Đặt hàng thành công!
            </h1>
            <p className="text-(--md-sys-color-on-surface-variant) text-lg">
              {message ? decodeURIComponent(message) : 'Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.'}
            </p>
          </div>
          
          {/* Order Details */}
          {order && (
            <Card variant="outlined" className="mb-8">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-(--md-sys-color-on-surface) mb-6 flex items-center gap-2">
                  <span className="mdi text-(--md-sys-color-primary)">receipt_long</span>
                  Chi tiết đơn hàng
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-(--md-sys-color-on-surface-variant)">Mã đơn hàng</span>
                      <div className="text-lg font-semibold text-(--md-sys-color-on-surface)">#{order.id}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-(--md-sys-color-on-surface-variant)">Ngày đặt hàng</span>
                      <div className="text-lg font-semibold text-(--md-sys-color-on-surface)">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-(--md-sys-color-on-surface-variant)">Tổng tiền</span>
                      <div className="text-lg font-semibold text-(--md-sys-color-primary)">{formatVND(order.totalPrice)}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-(--md-sys-color-on-surface-variant)">Phương thức thanh toán</span>
                      <div className="text-lg font-semibold text-(--md-sys-color-on-surface)">
                        {order.paymentMethod === PaymentMethod.CASH_ON_DELIVERY ? 'Thanh toán khi nhận hàng' :
                         order.paymentMethod === PaymentMethod.CREDIT_CARD ? 'Thẻ tín dụng' :
                         order.paymentMethod === PaymentMethod.VIETTEL_MONEY ? 'Viettel Money' : order.paymentMethod}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="border-t border-(--md-sys-color-outline-variant) pt-6">
                  <h3 className="text-lg font-semibold text-(--md-sys-color-on-surface) mb-4 flex items-center gap-2">
                    <span className="mdi text-(--md-sys-color-primary)">inventory_2</span>
                    Sản phẩm đã đặt
                  </h3>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-start p-4 bg-(--md-sys-color-surface-container) rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-(--md-sys-color-on-surface)">{item.productName}</div>
                          <div className="text-sm text-(--md-sys-color-on-surface-variant) mt-1">
                            Số lượng: {item.quantity} × {formatVND(item.price)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-(--md-sys-color-on-surface)">{formatVND(item.totalPrice)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
          
          {/* Next Steps */}
          <Card variant="filled" className="mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-(--md-sys-color-on-surface) mb-4 flex items-center gap-2">
                <span className="mdi text-(--md-sys-color-primary)">timeline</span>
                Bước tiếp theo
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-(--md-sys-color-primary) mt-2 flex-shrink-0"></div>
                  <p className="text-(--md-sys-color-on-surface-variant)">
                    Chúng tôi sẽ gửi email xác nhận đơn hàng cho bạn
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-(--md-sys-color-primary) mt-2 flex-shrink-0"></div>
                  <p className="text-(--md-sys-color-on-surface-variant)">
                    Đơn hàng sẽ được chuẩn bị và đóng gói trong 1-2 ngày làm việc
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-(--md-sys-color-primary) mt-2 flex-shrink-0"></div>
                  <p className="text-(--md-sys-color-on-surface-variant)">
                    Bạn sẽ nhận được thông báo khi đơn hàng được giao
                  </p>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/orders" className="flex-1 sm:flex-none">
              <Button 
                variant="filled" 
                label="Xem đơn hàng"
                hasIcon
                icon="visibility"
                className="w-full sm:w-auto"
              />
            </Link>
            <Link href="/categories" className="flex-1 sm:flex-none">
              <Button 
                variant="outlined" 
                label="Tiếp tục mua sắm"
                hasIcon
                icon="shopping_cart"
                className="w-full sm:w-auto"
              />
            </Link>
          </div>
          
          {/* Support Info */}
          <Card variant="outlined" className="bg-(--md-sys-color-primary-container)">
            <div className="p-6">
              <h4 className="font-semibold text-(--md-sys-color-on-primary-container) mb-3 flex items-center gap-2">
                <span className="mdi text-(--md-sys-color-primary)">support_agent</span>
                Cần hỗ trợ?
              </h4>
              <p className="text-sm text-(--md-sys-color-on-primary-container) mb-4">
                Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ với chúng tôi:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-(--md-sys-color-on-primary-container)">
                  <span className="mdi">email</span>
                  <span>support@vdt-ecom.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-(--md-sys-color-on-primary-container)">
                  <span className="mdi">phone</span>
                  <span>1900-1234</span>
                </div>
              </div>
            </div>
          </Card>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
