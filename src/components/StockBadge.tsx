"use client"
import { HTMLAttributes } from "react";
import Chip, { ChipColor } from "./Chip";

type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

type StockBadgeProps = {
    status: StockStatus;
    quantity?: number;
    showQuantity?: boolean;
    size?: 'small' | 'medium' | 'large';
} & Partial<HTMLAttributes<HTMLDivElement>>;

export default function StockBadge({ 
    status, 
    quantity = 0, 
    showQuantity = false,
    size = 'medium',
    className = "",
    ...htmlProps 
}: StockBadgeProps) {
    const getStockConfig = (status: StockStatus) => {
        switch (status) {
            case 'IN_STOCK':
                return {
                    label: showQuantity ? `In Stock (${quantity})` : 'In Stock',
                    color: 'success' as ChipColor,
                    icon: 'check_circle'
                };
            case 'LOW_STOCK':
                return {
                    label: showQuantity ? `Low Stock (${quantity})` : 'Low Stock',
                    color: 'warning' as ChipColor,
                    icon: 'warning'
                };
            case 'OUT_OF_STOCK':
                return {
                    label: 'Out of Stock',
                    color: 'error' as ChipColor,
                    icon: 'cancel'
                };
            default:
                return {
                    label: 'Unknown',
                    color: 'default' as ChipColor,
                    icon: 'help'
                };
        }
    };

    const config = getStockConfig(status);

    return (
        <div className={className} {...htmlProps}>
            <Chip
                label={config.label}
                color={config.color}
                hasIcon
                icon={config.icon}
                size={size}
            />
        </div>
    );
}
