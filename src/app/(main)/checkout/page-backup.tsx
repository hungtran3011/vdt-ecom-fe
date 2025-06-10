'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import SelectField from '@/components/SelectField';
import { useCartContext } from '@/contexts/CartContext';
import { formatVND } from '@/utils/currency';
import { OrderService } from '@/services/orderService';
import { AddressService, Province, District, Ward } from '@/services/addressService';
import paymentService from '@/services/paymentService';
import { CreateOrderRequest, PaymentMethod, OrderStatus, PaymentStatus } from '@/types/Order';
import { formatVND } from '@/utils/currency';
import { OrderService } from '@/services/orderService';
import { AddressService, Province, District, Ward } from '@/services/addressService';
import paymentService from '@/services/paymentService';
import { Order, PaymentMethod, OrderStatus, PaymentStatus } from '@/types/Order';

// Validation schema
const checkoutSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
  phone: z.string()
    .min(1, 'Vui lòng nhập số điện thoại')
    .regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
  email: z.string()
    .min(1, 'Vui lòng nhập email')
    .email('Email không hợp lệ'),
  address: z.string().min(1, 'Vui lòng nhập địa chỉ'),
  provinceCode: z.union([z.string(), z.number()]).refine(val => val !== '' && val !== 0, {
    message: 'Vui lòng chọn tỉnh/thành phố'
  }),
  districtCode: z.union([z.string(), z.number()]).refine(val => val !== '' && val !== 0, {
    message: 'Vui lòng chọn quận/huyện'
  }),
  wardCode: z.union([z.string(), z.number()]).refine(val => val !== '' && val !== 0, {
    message: 'Vui lòng chọn phường/xã'
  }),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface PaymentMethodOption {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    id: 'cod',
    name: 'Thanh toán khi nhận hàng (COD)',
    description: 'Thanh toán bằng tiền mặt khi nhận hàng',
    icon: 'payments'
  },
  {
    id: 'viettel_money_web',
    name: 'Viettel Money (Web)',
    description: 'Thanh toán qua trang web Viettel Money - hỗ trợ ví điện tử và thẻ ngân hàng',
    icon: 'account_balance_wallet'
  },
  {
    id: 'viettel_money_qr',
    name: 'Viettel Money (QR Code)',
    description: 'Quét mã QR để thanh toán qua ứng dụng Viettel Money',
    icon: 'qr_code'
  },
  {
    id: 'viettel_money_app',
    name: 'Viettel Money (Ứng dụng)',
    description: 'Mở trực tiếp ứng dụng Viettel Money để thanh toán',
    icon: 'smartphone'
  }
];

const CheckoutPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cart, isLoading, clearCart } = useCartContext();
  const orderService = useMemo(() => new OrderService(), []);
  const addressService = useMemo(() => new AddressService(), []);

  // Address data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingAddressData, setLoadingAddressData] = useState(false);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      address: '',
      provinceCode: '',
      districtCode: '',
      wardCode: '',
      notes: ''
    }
  });

  // Watch for address changes
  const provinceCode = watch('provinceCode');
  const districtCode = watch('districtCode');

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cod');

  // Pre-populate form with user session data
  useEffect(() => {
    if (session?.user) {
      setValue('fullName', session.user.name || '');
      setValue('email', session.user.email || '');
    }
  }, [session, setValue]);

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLoadingAddressData(true);
        const provincesData = await addressService.getProvinces();
        setProvinces(provincesData);
      } catch (error) {
        console.error('Failed to load provinces:', error);
      } finally {
        setLoadingAddressData(false);
      }
    };

    loadProvinces();
  }, [addressService]);

  // Load districts when province changes
  useEffect(() => {
    if (provinceCode && typeof provinceCode === 'number') {
      const loadDistricts = async () => {
        try {
          setLoadingAddressData(true);
          const districtsData = await addressService.getDistricts(provinceCode as number);
          setDistricts(districtsData);
          
          // Clear district and ward when province changes
          setValue('districtCode', '');
          setValue('wardCode', '');
        } catch (error) {
          console.error('Failed to load districts:', error);
        } finally {
          setLoadingAddressData(false);
        }
      };

      loadDistricts();
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [provinceCode, addressService, setValue]);

  // Load wards when district changes
  useEffect(() => {
    if (districtCode && typeof districtCode === 'number') {
      const loadWards = async () => {
        try {
          setLoadingAddressData(true);
          const wardsData = await addressService.getWards(districtCode as number);
          setWards(wardsData);
          
          // Clear ward when district changes
          setValue('wardCode', '');
        } catch (error) {
          console.error('Failed to load wards:', error);
        } finally {
          setLoadingAddressData(false);
        }
      };

      loadWards();
    } else {
      setWards([]);
    }
  }, [districtCode, addressService, setValue]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href));
    }
  }, [status, router]);

  // Address change handlers
  const handleProvinceChange = (provinceCode: string | number) => {
    const selectedProvince = provinces.find(p => p.code === Number(provinceCode));
    if (selectedProvince) {
      setValue('provinceCode', selectedProvince.code);
      setValue('districtCode', '');
      setValue('wardCode', '');
    }
  };

  const handleDistrictChange = (districtCode: string | number) => {
    const selectedDistrict = districts.find(d => d.code === Number(districtCode));
    if (selectedDistrict) {
      setValue('districtCode', selectedDistrict.code);
      setValue('wardCode', '');
    }
  };

  const handleWardChange = (wardCode: string | number) => {
    const selectedWard = wards.find(w => w.code === Number(wardCode));
    if (selectedWard) {
      setValue('wardCode', selectedWard.code);
    }
  };

  // Form submit handler
  const onSubmit = async (data: CheckoutFormData) => {
    if (!cart || !cart.items || cart.items.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    if (!session?.user) {
      alert('Vui lòng đăng nhập để đặt hàng!');
      return;
    }

    try {
      // Get address names for final order
      const selectedProvince = provinces.find(p => p.code === Number(data.provinceCode));
      const selectedDistrict = districts.find(d => d.code === Number(data.districtCode));
      const selectedWard = wards.find(w => w.code === Number(data.wardCode));

      // Convert payment method string to enum and return type
      const paymentMethodMap: Record<string, { method: PaymentMethod; returnType: 'WEB' | 'QR' | 'DEEPLINK' }> = {
        'cod': { method: PaymentMethod.CASH_ON_DELIVERY, returnType: 'WEB' },
        'viettel_money_web': { method: PaymentMethod.VIETTEL_MONEY, returnType: 'WEB' },
        'viettel_money_qr': { method: PaymentMethod.VIETTEL_MONEY, returnType: 'QR' },
        'viettel_money_app': { method: PaymentMethod.VIETTEL_MONEY, returnType: 'DEEPLINK' }
      };

      const paymentConfig = paymentMethodMap[selectedPaymentMethod] || { method: PaymentMethod.CASH_ON_DELIVERY, returnType: 'WEB' };
      const selectedPaymentMethodEnum = paymentConfig.method;
      const returnType = paymentConfig.returnType;

      // Convert cart items to order items
      const orderItems = cart.items.map((item) => ({
        // Don't set id - let backend auto-generate it
        productId: item.productId,
        productName: `Product ${item.productId}`, // TODO: Get actual product name
        productImage: '', // TODO: Get actual product image
        quantity: item.quantity,
        price: item.unitPrice,
        totalPrice: item.unitPrice * item.quantity
      }));

      // Create order object
      const userId = session.user.id;
      if (!userId) {
        alert('Không thể xác định thông tin người dùng. Vui lòng đăng nhập lại.');
        return;
      }

      const orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: userId,
        status: OrderStatus.PENDING_PAYMENT,
        address: `${data.address}, ${selectedWard?.name}, ${selectedDistrict?.name}, ${selectedProvince?.name}`,
        phone: data.phone,
        note: data.notes || '',
        paymentMethod: selectedPaymentMethodEnum,
        paymentStatus: PaymentStatus.PENDING,
        paymentId: '',
        totalPrice: cart.totalPrice,
        items: orderItems
      };

      // Submit order to backend
      const createdOrder = await orderService.createOrder(orderData);
      console.log('Order created successfully:', createdOrder);

      // Process payment based on selected method
      if (selectedPaymentMethodEnum === PaymentMethod.VIETTEL_MONEY) {
        // For Viettel Money, initiate payment with specific return type
        const paymentResult = await paymentService.initiateViettelPayment({
          orderId: createdOrder.id,
          returnType: returnType as 'WEB' | 'QR' | 'DEEPLINK',
          returnUrl: `${window.location.origin}/checkout/success?orderId=${createdOrder.id}`
        });

        if (paymentResult.success) {
          // Clear cart after successful order creation
          clearCart();

          // Handle different return types
          if (returnType === 'QR') {
            // Redirect to QR code page
            router.push(`/checkout/qr?orderId=${createdOrder.id}&qrCode=${encodeURIComponent(paymentResult.qrCode || '')}&message=${encodeURIComponent(paymentResult.orderInfo || 'Đang chờ thanh toán...')}`);
          } else if (returnType === 'DEEPLINK') {
            // Clear cart and redirect to app
            if (paymentResult.paymentUrl) {
              window.location.href = paymentResult.paymentUrl;
            } else {
              router.push(`/checkout/success?orderId=${createdOrder.id}&message=${encodeURIComponent('Vui lòng mở ứng dụng Viettel Money để hoàn thành thanh toán')}`);
            }
          } else {
            // WEB - redirect to payment gateway
            if (paymentResult.paymentUrl) {
              window.location.href = paymentResult.paymentUrl;
            } else {
              router.push(`/checkout/success?orderId=${createdOrder.id}&message=${encodeURIComponent('Không thể khởi tạo thanh toán. Vui lòng thử lại.')}`);
            }
          }
        } else {
          alert('Không thể khởi tạo thanh toán. Vui lòng thử lại.');
        }
      } else {
        // For COD, just clear cart and redirect to success
        clearCart();
        router.push(`/checkout/success?orderId=${createdOrder.id}&message=${encodeURIComponent('Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.')}`);
      }
    } catch (error) {
      console.error('Order submission failed:', error);
      alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    }
  };
    } catch (error) {
      console.error('Order submission failed:', error);
      alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
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

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-4xl text-gray-400">⚠️</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Giỏ hàng trống
            </h2>
            <p className="text-gray-600 mb-8">
              Bạn cần có sản phẩm trong giỏ hàng để thanh toán.
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
              
              <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Controller
                    name="fullName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        label="Họ và tên *"
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.fullName?.message}
                        variant="outlined"
                      />
                    )}
                  />
                </div>
                
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label="Số điện thoại *"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.phone?.message}
                      variant="outlined"
                    />
                  )}
                />
                
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label="Email *"
                      type="email"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.email?.message}
                      variant="outlined"
                    />
                  )}
                />
                  
                <div className="md:col-span-2">
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        label="Địa chỉ cụ thể *"
                        value={field.value} 
                        onChange={field.onChange}
                        error={errors.address?.message}
                        variant="outlined"
                      />
                    )}
                  />
                </div>
                
                <Controller
                  name="provinceCode"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      label="Tỉnh/Thành phố *"
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        handleProvinceChange(value);
                      }}
                      options={provinces.map(province => ({
                        value: province.code,
                        label: province.name
                      }))}
                      placeholder="Chọn tỉnh/thành phố"
                      error={!!errors.provinceCode}
                      supportingText={errors.provinceCode?.message}
                      disabled={loadingAddressData}
                      variant="outlined"
                      required
                    />
                  )}
                />
                
                <Controller
                  name="districtCode"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      label="Quận/Huyện *"
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        handleDistrictChange(value);
                      }}
                      options={districts.map(district => ({
                        value: district.code,
                        label: district.name
                      }))}
                      placeholder="Chọn quận/huyện"
                      error={!!errors.districtCode}
                      supportingText={errors.districtCode?.message}
                      disabled={!provinceCode || loadingAddressData}
                      variant="outlined"
                      required
                    />
                  )}
                />
                
                <div className="md:col-span-2">
                  <Controller
                    name="wardCode"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        label="Phường/Xã *"
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          handleWardChange(value);
                        }}
                        options={wards.map(ward => ({
                          value: ward.code,
                          label: ward.name
                        }))}
                        placeholder="Chọn phường/xã"
                        error={!!errors.wardCode}
                        supportingText={errors.wardCode?.message}
                        disabled={!districtCode || loadingAddressData}
                        variant="outlined"
                        required
                      />
                    )}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        label="Ghi chú (tùy chọn)"
                        value={field.value || ''}
                        onChange={field.onChange}
                        variant="outlined"
                      />
                    )}
                  />
                </div>
              </form>
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
                {cart.items?.map((item, index) => (
                  <div key={`${item.productId}-${item.variationId || 'default'}-${index}`} className="flex gap-3">
                    <div className="w-16 h-16 flex-shrink-0">
                      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-xs">Img</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        Sản phẩm #{item.productId}
                      </h4>
                      {item.variationId && (
                        <p className="text-xs text-gray-500">
                          Biến thể: #{item.variationId}
                        </p>
                      )}
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">
                          Số lượng: {item.quantity}
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                          {formatVND(item.unitPrice * item.quantity)}
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
                onClick={handleSubmit(onSubmit)}
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
