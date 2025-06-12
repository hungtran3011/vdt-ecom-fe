'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/Button';
import Card from '@/components/Card';
import IconButton from '@/components/IconButton';
import Chip from '@/components/Chip';
import { useCartContext } from '@/contexts/EnhancedCartContext';
import { formatVND } from '@/utils/currency';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useProduct } from '@/hooks/useProducts';
import { ProductVariation } from '@/types/Product';
import { t } from '@/utils/localization';

// Component to render individual cart item with product details
const CartItemWithDetails = ({ 
  cartItem, 
  onQuantityChange, 
  onRemove,
  onToggleSelection
}: {
  cartItem: {
    productId: number;
    variationId?: number;
    quantity: number;
    unitPrice: number;
    addedAt: string;
    selected: boolean;
  };
  onQuantityChange: (productId: number, variationId: number | undefined, quantity: number) => void;
  onRemove: (productId: number, variationId: number | undefined) => void;
  onToggleSelection: (productId: number, variationId: number | undefined) => void;
}) => {
  const { data: product, isLoading } = useProduct(cartItem.productId);

  if (isLoading) {
    return (
      <Card variant="elevated" className="p-4 md:p-6 animate-pulse">
        <div className="flex gap-4">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-(--md-sys-color-outline-variant) rounded-xl"></div>
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-(--md-sys-color-outline-variant) rounded-full w-3/4"></div>
            <div className="h-4 bg-(--md-sys-color-outline-variant) rounded-full w-1/2"></div>
            <div className="h-4 bg-(--md-sys-color-outline-variant) rounded-full w-1/4"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!product) {
    return (
      <Card variant="outlined" className="p-4 md:p-6 border-2 border-(--md-sys-color-error-container)">
        <div className="text-center">
          <span className="mdi text-3xl text-(--md-sys-color-error) mb-3 block">error</span>
          <p className="text-(--md-sys-color-error) font-medium mb-4">
            Sản phẩm không tồn tại
          </p>
          <Button
            variant="outlined"
            label="Xóa khỏi giỏ hàng"
            hasIcon
            icon="delete"
            onClick={() => onRemove(cartItem.productId, cartItem.variationId)}
            className="!border-(--md-sys-color-error) !text-(--md-sys-color-error)"
          />
        </div>
      </Card>
    );
  }

  const variation = product.variations?.find((v: ProductVariation) => v.id === cartItem.variationId);
  const unitPrice = variation ? product.basePrice + variation.additionalPrice : product.basePrice;
  const totalPrice = unitPrice * cartItem.quantity;

  return (
    <Card variant="elevated" className={`p-4 md:p-6 hover:shadow-md transition-shadow ${!cartItem.selected ? 'opacity-60' : ''}`}>
      <div className="flex gap-4">
        {/* Selection Checkbox */}
        <div className="flex items-start pt-2">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={cartItem.selected}
              onChange={() => onToggleSelection(cartItem.productId, cartItem.variationId)}
              className="w-5 h-5 rounded border-2 border-(--md-sys-color-outline) 
                         checked:bg-(--md-sys-color-primary) checked:border-(--md-sys-color-primary)
                         focus:ring-2 focus:ring-(--md-sys-color-primary) focus:ring-offset-2
                         text-(--md-sys-color-on-primary)"
            />
          </label>
        </div>

        {/* Product Image */}
        <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
          <div className="w-full h-full rounded-xl overflow-hidden bg-(--md-sys-color-surface-container-highest)">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="mdi text-2xl text-(--md-sys-color-on-surface-variant)">
                  image
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0 pr-2">
              <h3 className="text-base md:text-lg font-medium text-(--md-sys-color-on-surface) line-clamp-2">
                {product.name}
              </h3>
              {variation && (
                <Chip
                  variant="assist"
                  color="secondary"
                  label={variation.name}
                  className="mt-2"
                />
              )}
            </div>
            <IconButton
              variant="standard"
              icon="close"
              onClick={() => onRemove(cartItem.productId, cartItem.variationId)}
              className="text-(--md-sys-color-error)"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Quantity Controls */}
            <div className="flex items-center gap-1">
              <span className="text-sm text-(--md-sys-color-on-surface-variant) mr-2">
                Số lượng:
              </span>
              <IconButton
                variant="outlined"
                icon="remove"
                size="small"
                onClick={() => onQuantityChange(cartItem.productId, cartItem.variationId, cartItem.quantity - 1)}
                disabled={cartItem.quantity <= 1}
              />
              <div className="min-w-[40px] text-center">
                <span className="text-base font-medium text-(--md-sys-color-on-surface)">
                  {cartItem.quantity}
                </span>
              </div>
              <IconButton
                variant="outlined"
                icon="add"
                size="small"
                onClick={() => onQuantityChange(cartItem.productId, cartItem.variationId, cartItem.quantity + 1)}
              />
            </div>

            {/* Price */}
            <div className="text-right sm:text-left">
              <div className="text-lg font-semibold text-(--md-sys-color-primary)">
                {formatVND(totalPrice)}
              </div>
              <div className="text-sm text-(--md-sys-color-on-surface-variant)">
                {formatVND(unitPrice)} × {cartItem.quantity}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const CartPage = () => {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getCartTotal,
    toggleItemSelection,
    selectAllItems,
    getSelectedItemsCount,
    getSelectedItemsTotal
  } = useCartContext();
  const { showSnackbar } = useSnackbar();

  const handleQuantityChange = (productId: number, variationId: number | undefined, newQuantity: number) => {
    try {
      updateQuantity(productId, variationId, newQuantity);
      if (newQuantity === 0) {
        showSnackbar('Đã xóa sản phẩm khỏi giỏ hàng', 'success');
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      showSnackbar('Không thể cập nhật giỏ hàng', 'error');
    }
  };

  const handleRemoveItem = (productId: number, variationId: number | undefined) => {
    try {
      removeFromCart(productId, variationId);
      showSnackbar('Đã xóa sản phẩm khỏi giỏ hàng', 'success');
    } catch (error) {
      console.error('Error removing item:', error);
      showSnackbar('Không thể xóa sản phẩm', 'error');
    }
  };

  const handleToggleSelection = (productId: number, variationId: number | undefined) => {
    try {
      toggleItemSelection(productId, variationId);
    } catch (error) {
      console.error('Error toggling item selection:', error);
      showSnackbar('Không thể cập nhật lựa chọn', 'error');
    }
  };

  const handleSelectAll = (selected: boolean) => {
    try {
      selectAllItems(selected);
      showSnackbar(selected ? 'Đã chọn tất cả sản phẩm' : 'Đã bỏ chọn tất cả sản phẩm', 'success');
    } catch (error) {
      console.error('Error selecting all items:', error);
      showSnackbar('Không thể cập nhật lựa chọn', 'error');
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
      try {
        clearCart();
        showSnackbar('Đã xóa tất cả sản phẩm khỏi giỏ hàng', 'success');
      } catch (error) {
        console.error('Error clearing cart:', error);
        showSnackbar('Không thể xóa giỏ hàng', 'error');
      }
    }
  };

  const allItemsSelected = cart.items.length > 0 && cart.items.every(item => item.selected);
  const hasSelectedItems = getSelectedItemsCount() > 0;
  const selectedProductsCount = cart.items.filter(item => item.selected).length;

  // Empty cart state
  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-(--md-sys-color-background) px-4 py-8">
        <div className="container mx-auto max-w-4xl">
          <Card variant="elevated" className="text-center p-8 md:p-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-(--md-sys-color-surface-container-highest) rounded-full flex items-center justify-center">
              <span className="mdi text-4xl text-(--md-sys-color-on-surface-variant)">
                shopping_cart
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-(--md-sys-color-on-surface) mb-4">
              Giỏ hàng trống
            </h2>
            <p className="text-(--md-sys-color-on-surface-variant) mb-8 max-w-md mx-auto">
              Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/categories">
                <Button 
                  variant="filled" 
                  label="Khám phá danh mục"
                  hasIcon
                  icon="category"
                  className="min-w-[200px]"
                />
              </Link>
              <Link href="/products">
                <Button 
                  variant="outlined" 
                  label="Xem tất cả sản phẩm"
                  hasIcon
                  icon="inventory_2"
                  className="min-w-[200px]"
                />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--md-sys-color-background) px-4 py-6 md:py-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <Card variant="filled" className="p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-(--md-sys-color-on-surface) mb-2">
                Giỏ hàng của bạn
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <Chip
                  variant="assist"
                  color="primary"
                  label={`${cart.items.length} sản phẩm`}
                  selected
                />
                <span className="text-(--md-sys-color-on-surface-variant) text-sm">
                  • Tổng: {formatVND(getCartTotal())}
                </span>
                {selectedProductsCount !== cart.items.length && (
                  <span className="text-(--md-sys-color-primary) text-sm font-medium">
                    • Đã chọn: {formatVND(getSelectedItemsTotal())}
                  </span>
                )}
              </div>
            </div>
            <Button 
              variant="outlined" 
              label="Xóa tất cả"
              hasIcon
              icon="delete_sweep"
              onClick={handleClearCart}
              className="!border-(--md-sys-color-error) !text-(--md-sys-color-error) hover:!bg-(--md-sys-color-error-container)"
            />
          </div>
        </Card>

        {/* Select All Controls */}
        <Card variant="outlined" className="p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={allItemsSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-(--md-sys-color-outline) 
                             checked:bg-(--md-sys-color-primary) checked:border-(--md-sys-color-primary)
                             focus:ring-2 focus:ring-(--md-sys-color-primary) focus:ring-offset-2
                             text-(--md-sys-color-on-primary)"
                />
                <span className="ml-2 text-(--md-sys-color-on-surface) font-medium">
                  Chọn tất cả
                </span>
              </label>
              <span className="text-(--md-sys-color-on-surface-variant) text-sm">
                ({selectedProductsCount}/{cart.items.length} sản phẩm đã chọn)
              </span>
            </div>
            {hasSelectedItems && (
              <div className="flex items-center gap-2">
                <span className="text-(--md-sys-color-primary) font-medium">
                  Đã chọn: {formatVND(getSelectedItemsTotal())}
                </span>
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((cartItem) => (
              <CartItemWithDetails
                key={`${cartItem.productId}-${cartItem.variationId || 'no-variation'}`}
                cartItem={cartItem}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
                onToggleSelection={handleToggleSelection}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card variant="elevated" className="p-6 sticky top-6">
              <h3 className="text-xl font-semibold text-(--md-sys-color-on-surface) mb-6">
                Tóm tắt đơn hàng
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2 bg-(--md-sys-color-primary-container) px-3 rounded-lg">
                  <span className="text-(--md-sys-color-on-primary-container) font-medium">
                    Đã chọn ({selectedProductsCount}/{cart.items.length} sản phẩm):
                  </span>
                  <span className="font-bold text-(--md-sys-color-on-primary-container)">
                    {formatVND(getSelectedItemsTotal())}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-(--md-sys-color-on-surface-variant)">Phí vận chuyển:</span>
                  <Chip
                    variant="assist"
                    color="tertiary"
                    label="Miễn phí"
                    selected
                  />
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-(--md-sys-color-on-surface-variant)">Thuế:</span>
                  <span className="font-medium text-(--md-sys-color-on-surface)">
                    Đã bao gồm
                  </span>
                </div>
                
                <hr className="border-(--md-sys-color-outline-variant)" />
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-lg font-semibold text-(--md-sys-color-on-surface)">
                    Tổng thanh toán:
                  </span>
                  <span className="text-xl font-bold text-(--md-sys-color-primary)">
                    {formatVND(hasSelectedItems ? getSelectedItemsTotal() : getCartTotal())}
                  </span>
                </div>
              </div>
              
              {/* Checkout Actions */}
              <div className="space-y-3">
                {!hasSelectedItems && (
                  <Card variant="filled" className="p-3 !bg-(--md-sys-color-error-container) mb-3">
                    <div className="flex items-center gap-2">
                      <span className="mdi text-lg text-(--md-sys-color-on-error-container)">
                        warning
                      </span>
                      <span className="text-sm text-(--md-sys-color-on-error-container)">
                        Vui lòng chọn ít nhất một sản phẩm để thanh toán
                      </span>
                    </div>
                  </Card>
                )}

                <Link href="/checkout" className="block w-full">
                  <Button 
                    variant="filled" 
                    label={hasSelectedItems ? 
                      `Thanh toán ${getSelectedItemsCount()} sản phẩm` : 
                      "Tiến hành thanh toán"
                    }
                    hasIcon
                    icon="payment"
                    className="w-full"
                    disabled={!hasSelectedItems}
                  />
                </Link>
                
                <Link href="/categories" className="block w-full">
                  <Button 
                    variant="outlined" 
                    label="Tiếp tục mua sắm"
                    hasIcon
                    icon="arrow_back"
                    className="w-full"
                  />
                </Link>
              </div>
              
              {/* Security Info */}
              <Card variant="filled" className="mt-6 p-4 !bg-(--md-sys-color-tertiary-container)">
                <div className="flex items-start gap-3">
                  <span className="mdi text-xl text-(--md-sys-color-on-tertiary-container) mt-0.5">
                    security
                  </span>
                  <div>
                    <h4 className="font-medium text-(--md-sys-color-on-tertiary-container) mb-1">
                      Thanh toán an toàn
                    </h4>
                    <p className="text-sm text-(--md-sys-color-on-tertiary-container) opacity-90">
                      Thông tin của bạn được bảo mật với công nghệ mã hóa SSL 256-bit
                    </p>
                  </div>
                </div>
              </Card>
            </Card>
          </div>
        </div>

        {/* Breadcrumb */}
        <Card variant="outlined" className="mt-8 p-4">
          <div className="flex items-center gap-2 text-sm text-(--md-sys-color-on-surface-variant)">
            <Link href="/" className="hover:text-(--md-sys-color-primary) transition-colors">
              {t('navigation.home')}
            </Link>
            <span className="mdi text-sm">chevron_right</span>
            <span className="text-(--md-sys-color-on-surface)">Giỏ hàng</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CartPage;
