"use client"
import { useState } from "react";
import Button from "./Button";
import { useValidateProductStock } from "@/hooks/useStock";
import { useSnackbar } from "@/hooks/useSnackbar";

type StockAwareAddToCartProps = {
    productId: number;
    productName: string;
    quantity?: number;
    onAddToCart?: (productId: number, quantity: number) => void;
    variant?: 'filled' | 'outlined' | 'text';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    className?: string;
};

export default function StockAwareAddToCart({
    productId,
    productName,
    quantity = 1,
    onAddToCart,
    variant = 'filled',
    size = 'medium',
    disabled = false,
    className = ""
}: StockAwareAddToCartProps) {
    const [isValidating, setIsValidating] = useState(false);
    const validateStock = useValidateProductStock();
    const { showSnackbar } = useSnackbar();

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (disabled || isValidating) return;
        
        setIsValidating(true);
        
        try {
            const validation = await validateStock.mutateAsync({
                productId,
                quantity
            });
            
            if (validation.available) {
                if (onAddToCart) {
                    onAddToCart(productId, quantity);
                }
                showSnackbar(`Added ${productName} to cart`, 'success');
            } else {
                showSnackbar(
                    validation.message || `Not enough stock available. Only ${validation.availableQuantity} items left.`,
                    'error'
                );
            }
        } catch (error) {
            console.error('Error validating stock:', error);
            showSnackbar('Unable to verify stock availability. Please try again.', 'error');
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            label={isValidating ? "Checking..." : "Add to Cart"}
            icon={isValidating ? "hourglass_empty" : "shopping_cart"}
            disabled={disabled || isValidating}
            onClick={handleAddToCart}
            className={className}
        />
    );
}
