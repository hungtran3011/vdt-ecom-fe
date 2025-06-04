import { Category } from "./Category";
import { ColorHex } from "./Color";

export type ProductRequest = {
    name: string;
    description: string;
    basePrice: number;
    images: string[];
    category: Category;
    dynamicValues: ProductDynamicValue[];
};

export type ProductField = {
    id: number | string;
    fieldName: string;
    fieldType: string;
    appliesTo: string;
    required: boolean;
};

export type ProductDynamicValue = {
    id: number | string;
    productId?: number | string | null;
    variationId?: number | string | null;
    field: ProductField;
    value: string | number | boolean | Date | ColorHex;
};

export type ProductVariation = {
    id: number | string;
    productId?: number | string | null;
    type: string;
    name: string;
    additionalPrice: number;
    dynamicValues: ProductDynamicValue[];
};

export type Product = {
    id: number | string;
    name: string;
    description?: string;
    basePrice: number;
    images?: string[];
    category?: Category;
    categoryId?: number | string | null;
    dynamicValues?: ProductDynamicValue[];
    variations?: ProductVariation[];
};