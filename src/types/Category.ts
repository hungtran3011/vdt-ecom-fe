export type Category = {
    id: number;
    name: string;
    description?: string;
    dynamicFields?: CategoryDynamicField[];
    imageUrl?: string;
    productCount?: number;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export type CategoryDynamicField = {
    id: number;
    fieldName: string;
    fieldType: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'COLOR_HASH' | 'ENUM';
    appliesTo: 'PRODUCT' | 'VARIATION';
    required: boolean;
};

// Type for creating new categories where dynamic fields don't have IDs yet
export type CreateCategoryRequest = {
    name: string;
    description?: string;
    imageUrl?: string;
    dynamicFields?: Omit<CategoryDynamicField, 'id'>[];
};

// Type for updating existing categories
export type UpdateCategoryRequest = {
    name?: string;
    description?: string;
    imageUrl?: string;
    dynamicFields?: CategoryDynamicField[];
};

export type CategoryManagementProps = {
    title?: string;
    className?: string;
    onCategorySelect?: (category: Category) => void;
    onCategoryUpdate?: (category: Category) => void;
    fallbackCategories?: Category[];
    showActions?: boolean;
};