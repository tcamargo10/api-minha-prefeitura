import { z } from "zod";

export const createTicketSchema = z.object({
  serviceId: z.string().min(1, "Service is required"),
  departmentId: z.string().optional(),
  citizenId: z.string().optional(),
  payload: z.any().optional(),
  geo: z
    .object({
      type: z.literal("Point"),
      coordinates: z.tuple([z.number(), z.number()]),
    })
    .optional(),
});

export const updateTicketSchema = z.object({
  departmentId: z.string().optional(),
  citizenId: z.string().optional(),
  payload: z.any().optional(),
  geo: z
    .object({
      type: z.literal("Point"),
      coordinates: z.tuple([z.number(), z.number()]),
    })
    .optional(),
  status: z
    .enum([
      "RECEIVED",
      "UNDER_ANALYSIS",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELED",
    ])
    .optional(),
});

export const ticketResponseSchema = z.object({
  id: z.string(),
  serviceId: z.string(),
  departmentId: z.string().nullable(),
  citizenId: z.string().nullable(),
  payload: z.any().nullable(),
  geo: z.any().nullable(),
  status: z.enum([
    "RECEIVED",
    "UNDER_ANALYSIS",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELED",
  ]),
  createdAt: z.date(),
  updatedAt: z.date(),
  service: z.object({
    id: z.string(),
    title: z.string(),
    type: z.enum(["INFO", "FORM", "BOOKING"]),
  }),
  department: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
  citizen: z
    .object({
      id: z.string(),
      email: z.string().nullable(),
    })
    .nullable(),
});

export const ticketWithHistorySchema = ticketResponseSchema.extend({
  history: z.array(
    z.object({
      id: z.string(),
      from: z
        .enum([
          "RECEIVED",
          "UNDER_ANALYSIS",
          "IN_PROGRESS",
          "COMPLETED",
          "CANCELED",
        ])
        .nullable(),
      to: z.enum([
        "RECEIVED",
        "UNDER_ANALYSIS",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELED",
      ]),
      byUserId: z.string().nullable(),
      at: z.date(),
      actor: z
        .object({
          id: z.string(),
          email: z.string().nullable(),
        })
        .nullable(),
    })
  ),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type TicketResponse = z.infer<typeof ticketResponseSchema>;
export type TicketWithHistory = z.infer<typeof ticketWithHistorySchema>;
