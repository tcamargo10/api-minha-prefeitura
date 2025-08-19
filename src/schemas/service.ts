import { z } from 'zod';

export const createServiceSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  departmentId: z.string().optional(),
  type: z.enum(['INFO', 'FORM', 'BOOKING']),
  title: z.string().min(5, 'Title must have at least 5 characters'),
  summary: z.string().optional(),
  coverImage: z.string().url('Cover image must be a valid URL').optional(),
  slug: z.string().min(2, 'Slug must have at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers and hyphens'),
  position: z.number().int().min(0).optional().default(0),
  isFeatured: z.boolean().optional().default(false),
});

export const updateServiceSchema = z.object({
  categoryId: z.string().min(1, 'Category is required').optional(),
  departmentId: z.string().optional(),
  type: z.enum(['INFO', 'FORM', 'BOOKING']).optional(),
  title: z.string().min(5, 'Title must have at least 5 characters').optional(),
  summary: z.string().optional(),
  coverImage: z.string().url('Cover image must be a valid URL').optional(),
  slug: z.string().min(2, 'Slug must have at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers and hyphens').optional(),
  position: z.number().int().min(0).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const serviceResponseSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  departmentId: z.string().nullable(),
  type: z.enum(['INFO', 'FORM', 'BOOKING']),
  title: z.string(),
  summary: z.string().nullable(),
  coverImage: z.string().nullable(),
  slug: z.string(),
  position: z.number(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  category: z.object({
    id: z.string(),
    name: z.string(),
  }),
  department: z.object({
    id: z.string(),
    name: z.string(),
  }).nullable(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ServiceResponse = z.infer<typeof serviceResponseSchema>;
