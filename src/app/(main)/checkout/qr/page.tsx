'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Snackbar from '@/components/Snackbar';
import { useCartContext } from '@/contexts/CartContext';
import paymentService from '@/services/paymentService';
import { OrderService } from '@/services/orderService';
import { formatVND } from '@/utils/currency';
import { Order } from '@/types/Order';

interface QRPaymentStatus {
  orderId: string;
  orderStatus: string;
  transactionStatus: string;
  vtRequestId: string;
  errorCode: string;
  lastUpdated: string;
}

const QRPaymentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCartContext();
  
  const orderId = searchParams.get('orderId');
  const qrCode = searchParams.get('qrCode');
  
  const [paymentStatus, setPaymentStatus] = useState<QRPaymentStatus | null>(null);
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [isPolling, setIsPolling] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'info' | 'success' | 'warning' | 'error'>('info');

  const showSnackbar = (message: string, severity: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Check payment status
  const checkPaymentStatus = useCallback(async () => {
    if (!orderId) return;
    
    try {
      const status = await paymentService.checkPaymentStatus(orderId);
      setPaymentStatus(status);
      
      // If payment is successful, clear cart and redirect
      if (status.transactionStatus === 'SUCCESS' || status.orderStatus === 'PAID') {
        setIsPolling(false);
        clearCart();
        showSnackbar('Thanh toán thành công!', 'success');
        
        setTimeout(() => {
          router.push(`/checkout/success?orderId=${orderId}&message=${encodeURIComponent('Thanh toán thành công!')}`);
        }, 2000);
      } else if (status.transactionStatus === 'FAILED' || (status.errorCode && status.errorCode !== '00')) {
        setIsPolling(false);
        showSnackbar('Thanh toán thất bại. Vui lòng thử lại.', 'error');
        
        setTimeout(() => {
          router.push(`/checkout?error=${encodeURIComponent('Thanh toán thất bại')}`);
        }, 3000);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  }, [orderId, clearCart, router]);

  // Load order details
  useEffect(() => {
    if (orderId) {
      const loadOrder = async () => {
        try {
          const orderService = new OrderService();
          const orderData = await orderService.getOrderById(orderId);
          setOrder(orderData);
        } catch (error) {
          console.error('Error loading order:', error);
        }
      };
      
      loadOrder();
    }
  }, [orderId]);

  // Start polling for payment status
  useEffect(() => {
    if (!isPolling || !orderId) return;
    
    // Initial check
    checkPaymentStatus();
    
    // Poll every 3 seconds
    const interval = setInterval(checkPaymentStatus, 3000);
    
    return () => clearInterval(interval);
  }, [isPolling, orderId, checkPaymentStatus]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      setIsExpired(true);
      setIsPolling(false);
      showSnackbar('QR Code đã hết hạn. Vui lòng tạo đơn hàng mới.', 'warning');
      return;
    }
    
    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown]);

  // Format countdown time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleReturnToCheckout = () => {
    router.push('/checkout');
  };

  const handleRefreshStatus = () => {
    if (!isExpired) {
      checkPaymentStatus();
    }
  };

  if (!orderId || !qrCode) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen bg-[var(--md-sys-color-background)]">
        <div className="max-w-2xl mx-auto text-center">
          <Card variant="outlined" className="p-8">
            <span className="mdi text-6xl text-[var(--md-sys-color-error)] mb-4 block">error</span>
            <h1 className="text-2xl font-bold mb-4 text-[var(--md-sys-color-on-surface)]">
              Thông tin thanh toán không hợp lệ
            </h1>
            <p className="text-[var(--md-sys-color-on-surface-variant)] mb-6">
              Không thể tải thông tin thanh toán. Vui lòng thử lại.
            </p>
            <Button
              variant="filled"
              label="Quay lại thanh toán"
              onClick={handleReturnToCheckout}
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-[var(--md-sys-color-background)]">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-[var(--md-sys-color-on-background)]">
            Thanh toán QR Code
          </h1>
          <p className="text-[var(--md-sys-color-on-surface-variant)]">
            Quét mã QR bằng ứng dụng Viettel Money để hoàn thành thanh toán
          </p>
        </div>

        {/* QR Code Card */}
        <Card variant="elevated" className="mb-6">
          <div className="p-8 text-center">
            {/* QR Code */}
            <div className="mb-6">
              <div className="inline-block p-4 bg-white rounded-lg shadow-md">
                <Image
                  src={`data:image/png;base64,${qrCode}`}
                  alt="QR Code for Payment"
                  width={200}
                  height={200}
                  className="mx-auto"
                />
              </div>
            </div>

            {/* Timer */}
            <div className="mb-6">
              <div className={`text-3xl font-mono font-bold mb-2 ${
                countdown <= 60 ? 'text-[var(--md-sys-color-error)]' : 'text-[var(--md-sys-color-primary)]'
              }`}>
                {formatTime(countdown)}
              </div>
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                {isExpired ? 'QR Code đã hết hạn' : 'Thời gian còn lại'}
              </p>
            </div>

            {/* Status */}
            <div className="mb-6">
              {paymentStatus ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className={`mdi text-lg ${
                      paymentStatus.transactionStatus === 'SUCCESS' 
                        ? 'text-[var(--md-sys-color-primary)]' 
                        : paymentStatus.transactionStatus === 'FAILED'
                        ? 'text-[var(--md-sys-color-error)]'
                        : 'text-[var(--md-sys-color-tertiary)]'
                    }`}>
                      {paymentStatus.transactionStatus === 'SUCCESS' 
                        ? 'check_circle' 
                        : paymentStatus.transactionStatus === 'FAILED'
                        ? 'error'
                        : 'schedule'}
                    </span>
                    <span className="font-medium text-[var(--md-sys-color-on-surface)]">
                      {paymentStatus.transactionStatus === 'SUCCESS' 
                        ? 'Thanh toán thành công' 
                        : paymentStatus.transactionStatus === 'FAILED'
                        ? 'Thanh toán thất bại'
                        : 'Đang chờ thanh toán'}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                    Cập nhật lần cuối: {new Date(paymentStatus.lastUpdated).toLocaleTimeString('vi-VN')}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span className="mdi text-lg text-[var(--md-sys-color-tertiary)] animate-spin">
                    refresh
                  </span>
                  <span className="text-[var(--md-sys-color-on-surface-variant)]">
                    Đang kiểm tra trạng thái...
                  </span>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="text-left bg-[var(--md-sys-color-surface-container)] rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-[var(--md-sys-color-on-surface)] mb-3 flex items-center gap-2">
                <span className="mdi">info</span>
                Hướng dẫn thanh toán
              </h3>
              <ol className="space-y-2 text-sm text-[var(--md-sys-color-on-surface-variant)]">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[var(--md-sys-color-primary)]">1.</span>
                  Mở ứng dụng Viettel Money trên điện thoại
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[var(--md-sys-color-primary)]">2.</span>
                  Chọn &quot;Quét QR&quot; hoặc &quot;Thanh toán QR&quot;
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[var(--md-sys-color-primary)]">3.</span>
                  Quét mã QR trên màn hình này
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[var(--md-sys-color-primary)]">4.</span>
                  Xác nhận thông tin và hoàn thành thanh toán
                </li>
              </ol>
            </div>

            {/* Order Summary */}
            {order && (
              <div className="text-left bg-[var(--md-sys-color-tertiary-container)] rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-[var(--md-sys-color-on-tertiary-container)] mb-3 flex items-center gap-2">
                  <span className="mdi">receipt</span>
                  Thông tin đơn hàng
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--md-sys-color-on-tertiary-container)]">Mã đơn hàng:</span>
                    <span className="font-mono text-[var(--md-sys-color-on-tertiary-container)]">#{order.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--md-sys-color-on-tertiary-container)]">Số lượng sản phẩm:</span>
                    <span className="text-[var(--md-sys-color-on-tertiary-container)]">{order.items?.length || 0} sản phẩm</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
                    <span className="text-[var(--md-sys-color-on-tertiary-container)]">Tổng tiền:</span>
                    <span className="text-[var(--md-sys-color-on-tertiary-container)]">{formatVND(order.totalPrice)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outlined"
                label="Làm mới trạng thái"
                onClick={handleRefreshStatus}
                hasIcon
                icon="refresh"
                disabled={isExpired}
              />
              <Button
                variant="text"
                label="Quay lại thanh toán"
                onClick={handleReturnToCheckout}
                hasIcon
                icon="arrow_back"
              />
            </div>
          </div>
        </Card>

        {/* Help Section */}
        <Card variant="outlined" className="mb-6">
          <div className="p-6">
            <h3 className="font-semibold text-[var(--md-sys-color-on-surface)] mb-4 flex items-center gap-2">
              <span className="mdi text-[var(--md-sys-color-primary)]">help</span>
              Cần hỗ trợ?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-[var(--md-sys-color-on-surface)] mb-2">
                  Không quét được QR Code?
                </h4>
                <ul className="space-y-1 text-[var(--md-sys-color-on-surface-variant)]">
                  <li>• Đảm bảo camera điện thoại hoạt động tốt</li>
                  <li>• Điều chỉnh độ sáng màn hình</li>
                  <li>• Thử làm mới trang</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-[var(--md-sys-color-on-surface)] mb-2">
                  Thanh toán không thành công?
                </h4>
                <ul className="space-y-1 text-[var(--md-sys-color-on-surface-variant)]">
                  <li>• Kiểm tra số dư tài khoản</li>
                  <li>• Đảm bảo kết nối internet ổn định</li>
                  <li>• Liên hệ hotline: 18008098</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Security Notice */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface-container)] px-4 py-2 rounded-full">
            <span className="mdi text-[var(--md-sys-color-tertiary)]">security</span>
            <span>Giao dịch được bảo mật bởi Viettel Money</span>
          </div>
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        isOpen={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />
    </div>
  );
};

export default QRPaymentPage;
