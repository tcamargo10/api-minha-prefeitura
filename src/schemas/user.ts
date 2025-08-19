import { z } from "zod";

export const createUserSchema = z.object({
  cpf: z.string().min(1, "CPF is required"),
  passwordHash: z.string().min(1, "Password hash is required"),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email("Invalid email").optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const userResponseSchema = z.object({
  id: z.string(),
  cpf: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const userPiiSchema = z.object({
  cpf: z
    .string()
    .min(11, "CPF must have 11 digits")
    .max(11, "CPF must have 11 digits"),
  name: z.string().min(2, "Name must have at least 2 characters"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
});

export const loginSchema = z.object({
  cpf: z
    .string()
    .min(11, "CPF must have 11 digits")
    .max(11, "CPF must have 11 digits"),
  password: z.string().min(1, "Password is required"),
  tenantSlug: z.string().optional(), // opcional para permitir login sem especificar tenant
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type UserPiiInput = z.infer<typeof userPiiSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
