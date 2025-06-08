'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import IconButton from '@/components/IconButton';
import Chip from '@/components/Chip';
import { useProduct } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { Product, ProductVariation } from '@/types/Product';
import { useSnackbar } from '@/hooks/useSnackbar';
import { cn } from '@/utils/cn';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  
  const productId = parseInt(params.id as string);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fetch product data
  const { data: product, isLoading, error } = useProduct(productId);
  const addToCartMutation = useAddToCart();

  const currentPrice = selectedVariation 
    ? product?.basePrice + selectedVariation.additionalPrice 
    : product?.basePrice || 0;

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        variationId: selectedVariation?.id,
        quantity
      });
      
      showSnackbar('Đã thêm sản phẩm vào giỏ hàng', 'success');
    } catch (err) {
      console.error('Error adding to cart:', err);
      showSnackbar('Không thể thêm sản phẩm vào giỏ hàng', 'error');
    }
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-(--md-sys-color-background) p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-(--md-sys-color-on-surface-variant)">
              Đang tải thông tin sản phẩm...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-(--md-sys-color-background) p-4">
        <div className="max-w-6xl mx-auto">
          <Card>
            <div className="p-8 text-center">
              <span className="mdi text-4xl text-(--md-sys-color-error) mb-4 block">
                error
              </span>
              <h3 className="text-lg font-medium text-(--md-sys-color-on-surface) mb-2">
                Không tìm thấy sản phẩm
              </h3>
              <p className="text-(--md-sys-color-on-surface-variant) mb-4">
                Sản phẩm này có thể đã bị xóa hoặc không tồn tại
              </p>
              <Button
                variant="filled"
                label="Quay lại"
                onClick={() => router.back()}
              />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--md-sys-color-background)">
      <div className="max-w-6xl mx-auto p-4">
        {/* Navigation */}
        <div className="flex items-center gap-2 mb-6 text-(--md-sys-color-on-surface-variant)">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 hover:text-(--md-sys-color-on-surface) transition-colors"
          >
            <span className="mdi">arrow_back</span>
            <span>Quay lại</span>
          </button>
          
          {product.category && (
            <>
              <span className="mdi">chevron_right</span>
              <span>{product.category.name}</span>
              <span className="mdi">chevron_right</span>
              <span className="text-(--md-sys-color-on-surface)">{product.name}</span>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <Card className="overflow-hidden">
              <div className="aspect-square bg-(--md-sys-color-surface-container-highest) relative">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImageIndex]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="mdi text-6xl text-(--md-sys-color-on-surface-variant)">
                      image
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                      selectedImageIndex === index 
                        ? "border-(--md-sys-color-primary)" 
                        : "border-(--md-sys-color-outline-variant)"
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-(--md-sys-color-on-surface) mb-2">
                {product.name}
              </h1>
              
              {product.category && (
                <Chip
                  variant="assist"
                  color="secondary"
                  label={product.category.name}
                  className="mb-4"
                />
              )}

              <div className="text-2xl font-bold text-(--md-sys-color-primary) mb-4">
                {currentPrice.toLocaleString('vi-VN')}₫
              </div>

              {product.description && (
                <p className="text-(--md-sys-color-on-surface-variant) leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            {/* Variations */}
            {product.variations && product.variations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-(--md-sys-color-on-surface) mb-3">
                  Lựa chọn
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {product.variations.map((variation) => (
                    <button
                      key={variation.id}
                      onClick={() => setSelectedVariation(
                        selectedVariation?.id === variation.id ? null : variation
                      )}
                      className={cn(
                        "p-3 rounded-lg border-2 text-left transition-colors",
                        selectedVariation?.id === variation.id
                          ? "border-(--md-sys-color-primary) bg-(--md-sys-color-primary-container)"
                          : "border-(--md-sys-color-outline-variant) hover:border-(--md-sys-color-outline)"
                      )}
                    >
                      <div className="font-medium text-(--md-sys-color-on-surface)">
                        {variation.name}
                      </div>
                      <div className="text-sm text-(--md-sys-color-on-surface-variant)">
                        +{variation.additionalPrice.toLocaleString('vi-VN')}₫
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <h3 className="text-lg font-semibold text-(--md-sys-color-on-surface) mb-3">
                Số lượng
              </h3>
              <div className="flex items-center gap-3">
                <IconButton
                  icon="remove"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                />
                <span className="min-w-[3rem] text-center text-lg font-medium text-(--md-sys-color-on-surface)">
                  {quantity}
                </span>
                <IconButton
                  icon="add"
                  onClick={() => handleQuantityChange(1)}
                />
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-3">
              <Button
                variant="filled"
                label={`Thêm vào giỏ hàng - ${(currentPrice * quantity).toLocaleString('vi-VN')}₫`}
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
                hasIcon
                icon="shopping_cart"
                className="w-full"
              />
              
              <div className="flex gap-3">
                <Button
                  variant="outlined"
                  label="Mua ngay"
                  onClick={() => {
                    handleAddToCart();
                    router.push('/cart');
                  }}
                  disabled={addToCartMutation.isPending}
                  hasIcon
                  icon="flash_on"
                  className="flex-1"
                />
                
                <IconButton
                  icon="favorite_border"
                  onClick={() => showSnackbar('Tính năng yêu thích đang phát triển', 'info')}
                />
                
                <IconButton
                  icon="share"
                  onClick={() => {
                    navigator.share?.({
                      title: product.name,
                      text: product.description,
                      url: window.location.href
                    }) || showSnackbar('Đã sao chép liên kết', 'success');
                  }}
                />
              </div>
            </div>

            {/* Product Features */}
            <Card variant="outlined">
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-(--md-sys-color-on-surface)">
                  Thông tin sản phẩm
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="mdi text-(--md-sys-color-primary)">verified</span>
                    <span className="text-(--md-sys-color-on-surface-variant)">
                      Sản phẩm chính hãng
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="mdi text-(--md-sys-color-primary)">local_shipping</span>
                    <span className="text-(--md-sys-color-on-surface-variant)">
                      Miễn phí vận chuyển
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="mdi text-(--md-sys-color-primary)">replay</span>
                    <span className="text-(--md-sys-color-on-surface-variant)">
                      Đổi trả trong 7 ngày
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
