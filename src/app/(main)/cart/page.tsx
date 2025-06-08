'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/Button';
import { useCart, useRemoveFromCart, useUpdateCartItem, useClearCart } from '@/hooks/useCart';
import { formatVND } from '@/utils/currency';

const CartPage = () => {
  const { data: cart, isLoading, error } = useCart();
  const removeFromCart = useRemoveFromCart();
  const updateCartItem = useUpdateCartItem();
  const clearCart = useClearCart();

  const handleQuantityChange = (cartItemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart.mutate(cartItemId);
    } else {
      updateCartItem.mutate({ cartItemId, quantity: newQuantity });
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
      clearCart.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Có lỗi xảy ra</h2>
            <p className="text-red-600 mb-4">Không thể tải thông tin giỏ hàng. Vui lòng thử lại sau.</p>
            <Button 
              variant="filled" 
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700"
            >
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-4xl text-gray-400">🛒</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
            <Link href="/categories">
              <Button variant="filled" className="bg-blue-600 hover:bg-blue-700">
                Tiếp tục mua sắm
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
          <Button 
            variant="outlined" 
            onClick={handleClearCart}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Xóa tất cả
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 flex-shrink-0">
                    <Image
                      src={item.product.images?.[0] || '/placeholder-product.png'}
                      alt={item.product.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.product.name}
                        </h3>
                        {item.variation && (
                          <p className="text-sm text-gray-600">
                            Loại: {item.variation.name}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart.mutate(item.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        disabled={removeFromCart.isPending}
                      >
                        <span className="mdi w-5 h-5">close</span>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={updateCartItem.isPending || item.quantity <= 1}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="mdi w-4 h-4">remove</span>
                        </button>
                        <span className="text-lg font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={updateCartItem.isPending}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="mdi w-4 h-4">add</span>
                        </button>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right">
                        <div className="text-lg font-semibold text-blue-600">
                          {formatVND(item.totalPrice)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatVND(item.price)} × {item.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 sticky top-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Tóm tắt đơn hàng</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính ({cart.totalItems} sản phẩm):</span>
                  <span className="font-medium">{formatVND(cart.totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-medium">Miễn phí</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thuế:</span>
                  <span className="font-medium">Đã bao gồm</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600">{formatVND(cart.totalPrice)}</span>
                  </div>
                </div>
              </div>
              
              {/* Checkout Button */}
              <Link href="/checkout" className="block w-full">
                <Button 
                  variant="filled" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                >
                  Tiến hành thanh toán
                </Button>
              </Link>
              
              {/* Continue Shopping */}
              <Link href="/categories" className="block w-full mt-4">
                <Button 
                  variant="outlined" 
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Tiếp tục mua sắm
                </Button>
              </Link>
              
              {/* Security Info */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <span className="mdi w-5 h-5">security</span>
                  <span className="text-sm font-medium">Thanh toán an toàn</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Thông tin của bạn được bảo mật với công nghệ mã hóa SSL
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="mt-8 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">Trang chủ</Link>
          <span className="mx-2">›</span>
          <span>Giỏ hàng</span>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
