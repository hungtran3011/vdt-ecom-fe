import { z } from 'zod';

// Category form validation schema
export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên danh mục không được để trống')
    .min(2, 'Tên danh mục phải có ít nhất 2 ký tự')
    .max(50, 'Tên danh mục không được quá 50 ký tự'),
  
  description: z
    .string()
    .max(500, 'Mô tả không được quá 500 ký tự'),
  
  parentCategoryId: z
    .number()
    .min(1, 'Vui lòng chọn danh mục cha')
    .nullable()
    .optional(),
  
  isActive: z
    .boolean()
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;

// Create category schema - same as base schema
export const createCategorySchema = categoryFormSchema;
export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;

// Update category schema - all fields optional except ID
export const updateCategorySchema = categoryFormSchema.partial().extend({
  id: z.number().min(1, 'ID danh mục không hợp lệ')
});
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;
