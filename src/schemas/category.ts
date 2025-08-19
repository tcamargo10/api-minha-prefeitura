import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters'),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color').optional(),
  position: z.number().int().min(0).optional().default(0),
  isFeatured: z.boolean().optional().default(false),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters').optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color').optional(),
  position: z.number().int().min(0).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const categoryResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  position: z.number(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryResponse = z.infer<typeof categoryResponseSchema>;
