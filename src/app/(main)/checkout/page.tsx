'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import SelectField from '@/components/SelectField';
import Snackbar from '@/components/Snackbar';
import { useCartContext } from '@/contexts/EnhancedCartContext';
import { formatVND } from '@/utils/currency';
import { useProduct } from '@/hooks/useProducts';
import { AddressService, Province, District, Ward } from '@/services/addressService';
import paymentService from '@/services/paymentService';
import { PaymentMethod } from '@/types/Order';
import { useEnhancedCheckout, useValidateCheckout } from '@/hooks/useEnhancedCheckout';

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

// Component to render individual checkout item with product details
const CheckoutItemWithDetails = ({ 
  cartItem 
}: {
  cartItem: {
    productId: number;
    variationId?: number;
    quantity: number;
    unitPrice: number;
    addedAt: string;
    selected: boolean;
  };
}) => {
  const { data: product, isLoading } = useProduct(cartItem.productId);

  if (isLoading) {
    return (
      <div className="flex gap-3 animate-pulse">
        <div className="w-16 h-16 flex-shrink-0 bg-[var(--md-sys-color-surface-variant)] rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[var(--md-sys-color-surface-variant)] rounded w-3/4"></div>
          <div className="h-3 bg-[var(--md-sys-color-surface-variant)] rounded w-1/2"></div>
          <div className="h-3 bg-[var(--md-sys-color-surface-variant)] rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex gap-3">
        <div className="w-16 h-16 flex-shrink-0">
          <div className="w-full h-full rounded-lg flex items-center justify-center bg-[var(--md-sys-color-error-container)]">
            <span className="text-xs text-[var(--md-sys-color-on-error-container)]">!</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium truncate text-[var(--md-sys-color-error)]">
            Sản phẩm không tồn tại
          </h4>
          <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
            Số lượng: {cartItem.quantity}
          </span>
        </div>
      </div>
    );
  }

  const variation = product.variations?.find((v: { id: number; name: string; additionalPrice: number }) => v.id === cartItem.variationId);
  const displayPrice = variation ? product.basePrice + variation.additionalPrice : product.basePrice;

  return (
    <div className="flex gap-3">
      <div className="w-16 h-16 flex-shrink-0">
        <div className="w-full h-full rounded-lg overflow-hidden bg-[var(--md-sys-color-surface-variant)]">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Img</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate text-[var(--md-sys-color-on-surface)]">
          {product.name}
        </h4>
        {variation && (
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
            {variation.name}
          </p>
        )}
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
            Số lượng: {cartItem.quantity}
          </span>
          <span className="text-sm font-medium text-[var(--md-sys-color-primary)]">
            {formatVND(displayPrice * cartItem.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
};

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
  const { 
    cart, 
    isLoading, 
    getSelectedItems, 
    getSelectedItemsTotal 
  } = useCartContext();
  const addressService = useMemo(() => new AddressService(), []);

  // Enhanced checkout hooks
  const enhancedCheckout = useEnhancedCheckout();
  const { data: validationResult } = useValidateCheckout();

  // Address data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingAddressData, setLoadingAddressData] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cod');

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'info' | 'success' | 'warning' | 'error'>('info');

  // Helper function to show snackbar
  const showSnackbar = (message: string, severity: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

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
    // Check if cart has selected items
    const selectedItems = getSelectedItems();
    if (!cart || !selectedItems || selectedItems.length === 0) {
      showSnackbar('Vui lòng chọn ít nhất một sản phẩm để thanh toán!', 'warning');
      return;
    }

    if (!session?.user) {
      showSnackbar('Vui lòng đăng nhập để đặt hàng!', 'warning');
      return;
    }

    // Show validation errors if any
    if (validationResult && !validationResult.valid) {
      const errorMessages = validationResult.invalidItems.map(item => 
        `Sản phẩm ID ${item.productId}: ${item.reason}`
      ).join(', ');
      showSnackbar(`Có lỗi với các sản phẩm: ${errorMessages}`, 'error');
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

      // Get user email with proper debugging
      const userEmail = session.user?.email;
      if (!userEmail) {
        console.error('No user email found in session:', session);
        showSnackbar('Không thể xác định email người dùng. Vui lòng đăng nhập lại.', 'error');
        return;
      }

      // Prepare checkout request for enhanced checkout service
      const checkoutRequest = {
        items: selectedItems.map(item => ({
          productId: item.productId,
          variationId: item.variationId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        userEmail: userEmail,
        address: `${data.address}, ${selectedWard?.name}, ${selectedDistrict?.name}, ${selectedProvince?.name}`,
        phone: data.phone,
        note: data.notes || '',
        paymentMethod: selectedPaymentMethodEnum.toString(),
      };

      console.log('Creating order with enhanced checkout:', checkoutRequest);

      // Use enhanced checkout service
      const checkoutResult = await enhancedCheckout.mutateAsync(checkoutRequest);
      console.log('Order created successfully:', checkoutResult);

      // Process payment based on selected method
      if (selectedPaymentMethodEnum === PaymentMethod.VIETTEL_MONEY) {
        // For Viettel Money, initiate payment with specific return type
        const paymentResult = await paymentService.initiateViettelPayment({
          orderId: checkoutResult.order.id,
          returnType: returnType as 'WEB' | 'QR' | 'DEEPLINK',
          returnUrl: `${window.location.origin}/checkout/success?orderId=${checkoutResult.order.id}`
        });

        if (paymentResult.success) {
          // Cart is already cleared by the enhanced checkout service

          // Handle different return types
          if (returnType === 'QR') {
            // Redirect to QR code page
            router.push(`/checkout/qr?orderId=${checkoutResult.order.id}&qrCode=${encodeURIComponent(paymentResult.qrCode || '')}&message=${encodeURIComponent(paymentResult.message || 'Đang chờ thanh toán...')}`);
          } else if (returnType === 'DEEPLINK') {
            // Redirect to app
            if (paymentResult.paymentUrl) {
              window.location.href = paymentResult.paymentUrl;
            } else {
              router.push(`/checkout/success?orderId=${checkoutResult.order.id}&message=${encodeURIComponent('Vui lòng mở ứng dụng Viettel Money để hoàn thành thanh toán')}`);
            }
          } else {
            // WEB - redirect to payment gateway
            if (paymentResult.paymentUrl) {
              window.location.href = paymentResult.paymentUrl;
            } else {
              router.push(`/checkout/success?orderId=${checkoutResult.order.id}&message=${encodeURIComponent('Không thể khởi tạo thanh toán. Vui lòng thử lại.')}`);
            }
          }
        } else {
          showSnackbar('Không thể khởi tạo thanh toán. Vui lòng thử lại.', 'error');
        }
      } else {
        // For COD, redirect to success (cart already cleared by enhanced checkout)
        router.push(`/checkout/success?orderId=${checkoutResult.order.id}&message=${encodeURIComponent('Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.')}`);
      }
    } catch (error) {
      console.error('Order submission failed:', error);
      showSnackbar('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--md-sys-color-background)]">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 rounded w-1/4 mb-8 bg-[var(--md-sys-color-surface-variant)]"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="rounded-lg shadow p-6 space-y-4 bg-[var(--md-sys-color-surface-container)]">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-12 rounded bg-[var(--md-sys-color-surface-variant)]"></div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg shadow p-6 bg-[var(--md-sys-color-surface-container)]">
                  <div className="space-y-4">
                    <div className="h-6 rounded w-1/2 bg-[var(--md-sys-color-surface-variant)]"></div>
                    <div className="h-4 rounded bg-[var(--md-sys-color-surface-variant)]"></div>
                    <div className="h-4 rounded bg-[var(--md-sys-color-surface-variant)]"></div>
                    <div className="h-12 rounded bg-[var(--md-sys-color-surface-variant)]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if cart has selected items for checkout
  const selectedItems = getSelectedItems();
  const hasSelectedItems = selectedItems && selectedItems.length > 0;

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen bg-[var(--md-sys-color-background)]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-lg shadow-lg p-12 bg-[var(--md-sys-color-surface-container)]">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-[var(--md-sys-color-surface-variant)]">
              <span className="mdi text-4xl text-[var(--md-sys-color-on-surface-variant)]">warning</span>
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">
              Giỏ hàng trống
            </h2>
            <p className="mb-8 text-[var(--md-sys-color-on-surface-variant)]">
              Bạn cần có sản phẩm trong giỏ hàng để thanh toán.
            </p>
            <Link href="/cart">
              <Button 
                variant="filled" 
                className="px-6 py-3 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
              >
                Quay lại giỏ hàng
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if no items are selected for checkout
  if (!hasSelectedItems) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen bg-[var(--md-sys-color-background)]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-lg shadow-lg p-12 bg-[var(--md-sys-color-surface-container)]">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-[var(--md-sys-color-surface-variant)]">
              <span className="mdi text-4xl text-[var(--md-sys-color-on-surface-variant)]">shopping_cart</span>
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">
              Chưa chọn sản phẩm nào
            </h2>
            <p className="mb-8 text-[var(--md-sys-color-on-surface-variant)]">
              Vui lòng quay lại giỏ hàng và chọn ít nhất một sản phẩm để thanh toán.
            </p>
            <Link href="/cart">
              <Button 
                variant="filled" 
                className="px-6 py-3 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
              >
                Quay lại giỏ hàng
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-[var(--md-sys-color-background)]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-[var(--md-sys-color-on-background)]">Thanh toán</h1>
          <div className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
            <Link href="/" className="hover:underline">Trang chủ</Link>
            <span className="mx-2">›</span>
            <Link href="/cart" className="hover:underline">Giỏ hàng</Link>
            <span className="mx-2">›</span>
            <span>Thanh toán</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Shipping & Payment */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <div className="rounded-lg shadow-md p-6 bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
              <h3 className="text-xl font-semibold mb-6 text-[var(--md-sys-color-on-surface)]">Thông tin giao hàng</h3>
              
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
            <div className="rounded-lg shadow-md p-6 bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
              <h3 className="text-xl font-semibold mb-6 text-[var(--md-sys-color-on-surface)]">Phương thức thanh toán</h3>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethod === method.id
                        ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)]'
                        : 'border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-state-layers-surface-container-opacity-008)]'
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
                      <span className={`mdi text-2xl ${
                        selectedPaymentMethod === method.id 
                          ? 'text-[var(--md-sys-color-on-primary-container)]' 
                          : 'text-[var(--md-sys-color-on-surface-variant)]'
                      }`}>
                        {method.icon}
                      </span>
                      <div className="flex-1">
                        <div className={`font-medium ${
                          selectedPaymentMethod === method.id 
                            ? 'text-[var(--md-sys-color-on-primary-container)]' 
                            : 'text-[var(--md-sys-color-on-surface)]'
                        }`}>
                          {method.name}
                        </div>
                        <div className={`text-sm ${
                          selectedPaymentMethod === method.id 
                            ? 'text-[var(--md-sys-color-on-primary-container)]' 
                            : 'text-[var(--md-sys-color-on-surface-variant)]'
                        }`}>
                          {method.description}
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedPaymentMethod === method.id
                          ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary)]'
                          : 'border-[var(--md-sys-color-outline)]'
                      }`}>
                        {selectedPaymentMethod === method.id && (
                          <div className="w-2 h-2 rounded-full mx-auto mt-0.5 bg-[var(--md-sys-color-on-primary)]"></div>
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
            <div className="rounded-lg shadow-md p-6 bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
              <h3 className="text-xl font-semibold mb-6 text-[var(--md-sys-color-on-surface)]">Đơn hàng của bạn</h3>
              
              {/* Order Items */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                {selectedItems.map((item, index) => (
                  <CheckoutItemWithDetails
                    key={`${item.productId}-${item.variationId || 'default'}-${index}`}
                    cartItem={item}
                  />
                ))}
              </div>
              
              {/* Order Summary */}
              <div className="border-t pt-4 space-y-3 border-[var(--md-sys-color-outline-variant)]">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--md-sys-color-on-surface-variant)]">Tạm tính ({selectedItems.length} sản phẩm đã chọn):</span>
                  <span className="font-medium text-[var(--md-sys-color-on-surface)]">{formatVND(getSelectedItemsTotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--md-sys-color-on-surface-variant)]">Phí vận chuyển:</span>
                  <span className="font-medium text-[var(--md-sys-color-tertiary)]">Miễn phí</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--md-sys-color-on-surface-variant)]">Thuế VAT:</span>
                  <span className="font-medium text-[var(--md-sys-color-on-surface)]">Đã bao gồm</span>
                </div>
                <div className="border-t pt-3 border-[var(--md-sys-color-outline-variant)]">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-[var(--md-sys-color-on-surface)]">Tổng cộng:</span>
                    <span className="text-[var(--md-sys-color-primary)]">{formatVND(getSelectedItemsTotal())}</span>
                  </div>
                </div>
              </div>
              
              {/* Place Order Button */}
              <Button
                variant="filled"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="w-full mt-6 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
              </Button>
              
              {/* Security Notice */}
              <div className="mt-4 p-3 rounded-lg bg-[var(--md-sys-color-tertiary-container)]">
                <div className="flex items-center gap-2 text-[var(--md-sys-color-on-tertiary-container)]">
                  <span className="mdi text-sm">lock</span>
                  <span className="text-xs font-medium">Giao dịch được bảo mật</span>
                </div>
                <p className="text-xs mt-1 text-[var(--md-sys-color-on-tertiary-container)]">
                  Thông tin cá nhân và thanh toán của bạn được mã hóa SSL 256-bit
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Snackbar for notifications */}
      <Snackbar
        message={snackbarMessage}
        isOpen={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        severity={snackbarSeverity}
        duration={4000}
      />
    </div>
  );
};

export default CheckoutPage;
