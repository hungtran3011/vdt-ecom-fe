import { z } from 'zod';

// Schema for dynamic field values
const dynamicValueSchema = z.object({
  fieldId: z.number(),
  value: z.union([z.string(), z.number(), z.boolean()]).transform((val) => {
    return val;
  }),
});

// Schema for product variations
const variationSchema = z.object({
  tempId: z.string().optional(),
  type: z.string().min(1, 'Loại biến thể là bắt buộc'),
  name: z.string().min(1, 'Tên biến thể là bắt buộc'),
  additionalPrice: z.number().min(0, 'Giá phụ phải lớn hơn hoặc bằng 0'),
  dynamicValues: z.array(dynamicValueSchema).default([]),
});

// Main product form schema
export const productFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên sản phẩm không được để trống')
    .min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự')
    .max(100, 'Tên sản phẩm không được quá 100 ký tự'),
  
  description: z
    .string()
    .max(1000, 'Mô tả không được quá 1000 ký tự'),
  
  basePrice: z
    .number()
    .min(0, 'Giá không được âm')
    .max(1000000000, 'Giá không được quá 1 tỷ'),
  
  categoryId: z
    .number()
    .min(1, 'Vui lòng chọn danh mục'),
  
  images: z
    .array(z.string().url('URL hình ảnh không hợp lệ'))
    .min(1, 'Vui lòng thêm ít nhất 1 hình ảnh')
    .max(5, 'Tối đa 5 hình ảnh'),
  
  dynamicValues: z.array(dynamicValueSchema).optional(),
  variations: z.array(variationSchema).optional(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;
export type ProductVariationFormData = z.infer<typeof variationSchema>;
export type DynamicValueFormData = z.infer<typeof dynamicValueSchema>;

// Create product schema - same as base schema
export const createProductSchema = productFormSchema;
export type CreateProductFormData = z.infer<typeof createProductSchema>;

// Update product schema - all fields optional except ID
export const updateProductSchema = productFormSchema.partial().extend({
  id: z.number().min(1, 'ID sản phẩm không hợp lệ')
});
export type UpdateProductFormData = z.infer<typeof updateProductSchema>;

// Export individual schemas for use in components
export { variationSchema, dynamicValueSchema };
