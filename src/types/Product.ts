import { Category } from "./Category";
import { ColorHex } from "./Color";

export type ProductField = {
    id: number;
    fieldName: string;
    fieldType: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'COLOR_HASH' | 'ENUM';
    appliesTo: 'PRODUCT' | 'VARIATION';
    required: boolean;
};

export type ProductDynamicValue = {
    id: number;
    productId?: number;
    variationId?: number;
    field: ProductField;
    value: string | number | boolean | Date | ColorHex;
};

export type ProductVariation = {
    id: number;
    productId?: number;
    type: string;
    name: string;
    additionalPrice: number;
    dynamicValues?: ProductDynamicValue[];
};

export type Product = {
    id: number;
    name: string;
    description?: string;
    basePrice: number;
    images?: string[];
    category?: Category;
    categoryId?: number;
    dynamicValues?: ProductDynamicValue[];
    variations?: ProductVariation[];
    createdAt?: string | Date;
    updatedAt?: string | Date;
};

// Type for creating new products
export type CreateProductRequest = {
    name: string;
    description?: string;
    basePrice: number;
    images?: string[];
    categoryId: number;
    dynamicValues?: Omit<ProductDynamicValue, 'id' | 'productId'>[];
    variations?: Omit<ProductVariation, 'id' | 'productId'>[];
};

// Type for updating existing products
export type UpdateProductRequest = {
    name?: string;
    description?: string;
    basePrice?: number;
    images?: string[];
    categoryId?: number;
    dynamicValues?: ProductDynamicValue[];
    variations?: ProductVariation[];
};

// Legacy type for backward compatibility
export type ProductRequest = CreateProductRequest;

export type ProductManagementProps = {
    title?: string;
    className?: string;
    onProductSelect?: (product: Product) => void;
    onProductUpdate?: (product: Product) => void;
    showActions?: boolean;
};