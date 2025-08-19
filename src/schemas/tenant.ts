import { z } from 'zod';

export const createTenantSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters'),
  slug: z.string().min(2, 'Slug must have at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers and hyphens'),
  plan: z.enum(['FREE', 'COMPLETE']).optional().default('FREE'),
  populationBand: z.enum(['UP_TO_50K', 'FROM_50K_TO_100K', 'ABOVE_100K']).optional().default('UP_TO_50K'),
  brandingJson: z.any().optional(),
});

export const updateTenantSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters').optional(),
  slug: z.string().min(2, 'Slug must have at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers and hyphens').optional(),
  plan: z.enum(['FREE', 'COMPLETE']).optional(),
  populationBand: z.enum(['UP_TO_50K', 'FROM_50K_TO_100K', 'ABOVE_100K']).optional(),
  brandingJson: z.any().optional(),
  isActive: z.boolean().optional(),
});

export const tenantResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  plan: z.enum(['FREE', 'COMPLETE']),
  populationBand: z.enum(['UP_TO_50K', 'FROM_50K_TO_100K', 'ABOVE_100K']),
  brandingJson: z.any().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
export type TenantResponse = z.infer<typeof tenantResponseSchema>;
