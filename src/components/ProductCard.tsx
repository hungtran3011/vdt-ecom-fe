"use client"
import { HTMLAttributes } from "react";
import Image from "next/image";
import Button from "./Button";
import Card from "./Card";
import { Product } from "@/types/Product";
import { formatVND } from "@/utils/currency";
import { t } from "@/utils/localization";

type ProductCardProps = {
    product: Product;
    onViewDetails?: () => void;
    onAddToCart?: () => void;
    size?: 'small' | 'medium' | 'large';
    showActions?: boolean;
} & Partial<HTMLAttributes<HTMLDivElement>>;

export default function ProductCard({ 
    product, 
    onViewDetails, 
    onAddToCart, 
    size = 'medium',
    showActions = true,
    className,
    ...htmlProps 
}: ProductCardProps) {
    const sizeClasses = {
        small: {
            container: 'max-w-[280px]',
            image: 'aspect-[4/3]',
            padding: 'p-3',
            title: 'text-sm',
            description: 'text-xs',
            price: 'text-base',
            buttons: 'text-xs px-3 py-1.5'
        },
        medium: {
            container: 'max-w-[320px]',
            image: 'aspect-square',
            padding: 'p-4',
            title: 'text-base',
            description: 'text-sm',
            price: 'text-lg',
            buttons: 'text-sm px-4 py-2'
        },
        large: {
            container: 'max-w-[380px]',
            image: 'aspect-square',
            padding: 'p-6',
            title: 'text-lg',
            description: 'text-base',
            price: 'text-xl',
            buttons: 'text-base px-6 py-3'
        }
    };

    const styles = sizeClasses[size];

    const handleViewDetails = () => {
        if (onViewDetails) {
            onViewDetails();
        } else {
            // Default behavior - navigate to product detail page
            window.location.href = `/products/${product.id}`;
        }
    };

    const handleAddToCart = () => {
        if (onAddToCart) {
            onAddToCart();
        } else {
            // Default behavior - could implement add to cart logic here
            console.log(`Adding ${product.name} to cart`);
        }
    };

    return (
        <div className={`w-full ${styles.container}`} {...htmlProps}>
            <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-200 group ${className || ''}`}>
                {/* Product Image */}
                <div className={`${styles.image} bg-(--md-sys-color-surface-container-highest) relative overflow-hidden`}>
                    {product.images && product.images.length > 0 ? (
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className={`mdi ${size === 'small' ? 'text-2xl' : size === 'medium' ? 'text-3xl' : 'text-4xl'} text-(--md-sys-color-on-surface-variant)`}>
                                image
                            </span>
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className={styles.padding}>
                    <h3 className={`font-medium text-(--md-sys-color-on-surface) mb-2 line-clamp-2 ${styles.title}`}>
                        {product.name}
                    </h3>
                    
                    {product.description && size !== 'small' && (
                        <p className={`text-(--md-sys-color-on-surface-variant) mb-3 line-clamp-2 ${styles.description}`}>
                            {product.description}
                        </p>
                    )}

                    <div className="flex items-center justify-between mb-3">
                        <div className={`font-semibold text-(--md-sys-color-primary) ${styles.price}`}>
                            {formatVND(product.basePrice)}
                        </div>
                        
                        {product.category && size !== 'small' && (
                            <div className="text-xs text-(--md-sys-color-on-surface-variant) bg-(--md-sys-color-surface-container-high) px-2 py-1 rounded">
                                {product.category.name}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    {showActions && (
                        <div className={`flex gap-2 ${size === 'small' ? 'flex-col' : ''}`}>
                            <Button
                                variant="outlined"
                                label={t('actions.viewDetails')}
                                className={`flex-1 ${styles.buttons}`}
                                hasIcon={size !== 'small'}
                                icon={size !== 'small' ? "visibility" : undefined}
                                onClick={handleViewDetails}
                            />
                            <Button
                                variant="filled"
                                label={t('actions.addToCart')}
                                className={`flex-1 ${styles.buttons}`}
                                hasIcon={size !== 'small'}
                                icon={size !== 'small' ? "shopping_cart" : undefined}
                                onClick={handleAddToCart}
                            />
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}