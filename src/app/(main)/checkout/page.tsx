'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { useCart, useClearCart } from '@/hooks/useCart';
import { formatVND } from '@/utils/currency';

interface ShippingInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  notes?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'cod',
    name: 'Thanh toán khi nhận hàng (COD)',
    description: 'Thanh toán bằng tiền mặt khi nhận hàng',
    icon: 'payments'
  },
  {
    id: 'bank_transfer',
    name: 'Chuyển khoản ngân hàng',
    description: 'Chuyển khoản qua Internet Banking hoặc ATM',
    icon: 'account_balance'
  },
  {
    id: 'credit_card',
    name: 'Thẻ tín dụng/Ghi nợ',
    description: 'Visa, MasterCard, JCB',
    icon: 'credit_card'
  },
  {
    id: 'e_wallet',
    name: 'Ví điện tử',
    description: 'MoMo, ZaloPay, VNPay',
    icon: 'account_balance_wallet'
  }
];

const CheckoutPage = () => {
  const router = useRouter();
  const { data: cart, isLoading, error } = useCart();
  const clearCart = useClearCart();

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    notes: ''
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<ShippingInfo>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingInfo> = {};

    if (!shippingInfo.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }

    if (!shippingInfo.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(shippingInfo.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!shippingInfo.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!shippingInfo.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }

    if (!shippingInfo.city.trim()) {
      newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
    }

    if (!shippingInfo.district.trim()) {
      newErrors.district = 'Vui lòng chọn quận/huyện';
    }

    if (!shippingInfo.ward.trim()) {
      newErrors.ward = 'Vui lòng chọn phường/xã';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;

    if (!cart || cart.items.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call to create order
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear cart after successful order
      clearCart.mutate();

      // Redirect to success page
      router.push('/checkout/success');
    } catch (error) {
      console.error('Order submission failed:', error);
      alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-4xl text-gray-400">⚠️</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {error ? 'Có lỗi xảy ra' : 'Giỏ hàng trống'}
            </h2>
            <p className="text-gray-600 mb-8">
              {error ? 'Không thể tải thông tin giỏ hàng.' : 'Bạn cần có sản phẩm trong giỏ hàng để thanh toán.'}
            </p>
            <Link href="/cart">
              <Button variant="filled" className="bg-blue-600 hover:bg-blue-700">
                Quay lại giỏ hàng
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán</h1>
          <div className="text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">Trang chủ</Link>
            <span className="mx-2">›</span>
            <Link href="/cart" className="hover:text-gray-700">Giỏ hàng</Link>
            <span className="mx-2">›</span>
            <span>Thanh toán</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Shipping & Payment */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Thông tin giao hàng</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <TextField
                    label="Họ và tên *"
                    value={shippingInfo.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    error={errors.fullName}
                    supportingText={errors.fullName}
                    variant="outlined"
                  />
                </div>
                
                <TextField
                  label="Số điện thoại *"
                  value={shippingInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={errors.phone}
                  supportingText={errors.phone}
                  variant="outlined"
                />
                
                <TextField
                  label="Email *"
                  type="email"
                  value={shippingInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                  supportingText={errors.email}
                  variant="outlined"
                />
                
                <div className="md:col-span-2">
                  <TextField
                    label="Địa chỉ cụ thể *"
                    value={shippingInfo.address} 
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    error={errors.address}
                    supportingText={errors.address}
                    variant="outlined"
                  />
                </div>
                
                <TextField
                  label="Tỉnh/Thành phố *"
                  value={shippingInfo.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  error={errors.city}
                  supportingText={errors.city}
                  variant="outlined"
                />
                
                <TextField
                  label="Quận/Huyện *"
                  value={shippingInfo.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  error={errors.district}
                  supportingText={errors.district}
                  variant="outlined"
                />
                
                <div className="md:col-span-2">
                  <TextField
                    label="Phường/Xã *"
                    value={shippingInfo.ward}
                    onChange={(e) => handleInputChange('ward', e.target.value)}
                    error={errors.ward}
                    supportingText={errors.ward}
                    variant="outlined"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <TextField
                    label="Ghi chú (tùy chọn)"
                    value={shippingInfo.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    variant="outlined"
                  />
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Phương thức thanh toán</h3>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-4 w-full">
                      <span className={`mdi w-8 h-8 ${
                        selectedPaymentMethod === method.id ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {method.icon}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{method.name}</div>
                        <div className="text-sm text-gray-500">{method.description}</div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedPaymentMethod === method.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedPaymentMethod === method.id && (
                          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:sticky lg:top-4 lg:h-fit">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Đơn hàng của bạn</h3>
              
              {/* Order Items */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 flex-shrink-0">
                      <Image
                        src={item.product.images?.[0] || '/placeholder-product.png'}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h4>
                      {item.variation && (
                        <p className="text-xs text-gray-500">
                          Loại: {item.variation.name}
                        </p>
                      )}
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">
                          Số lượng: {item.quantity}
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                          {formatVND(item.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order Summary */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính ({cart.totalItems} sản phẩm):</span>
                  <span className="font-medium">{formatVND(cart.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-medium text-green-600">Miễn phí</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Thuế VAT:</span>
                  <span className="font-medium">Đã bao gồm</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600">{formatVND(cart.totalPrice)}</span>
                  </div>
                </div>
              </div>
              
              {/* Place Order Button */}
              <Button
                variant="filled"
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
              </Button>
              
              {/* Security Notice */}
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <span className="mdi w-4 h-4">lock</span>
                  <span className="text-xs font-medium">Giao dịch được bảo mật</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Thông tin cá nhân và thanh toán của bạn được mã hóa SSL 256-bit
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
