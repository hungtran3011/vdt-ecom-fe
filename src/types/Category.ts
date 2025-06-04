export type Category = {
    id: string;
    name: string;
    dynamicFields: CategoryDynamicField[];
    imageUrl: string;
}

export type CategoryDynamicField = {
    id: string;
    fieldName: string;
    fieldType: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'COLOR_HASH' | 'ENUM';
    required: boolean;
};