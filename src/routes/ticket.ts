import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import {
  createTicketSchema,
  updateTicketSchema,
  ticketResponseSchema,
  ticketWithHistorySchema,
  CreateTicketInput,
  UpdateTicketInput,
} from "../schemas/ticket";
import { authenticateJWT } from "../middleware/auth";

const prisma = new PrismaClient();

export async function ticketRoutes(fastify: FastifyInstance) {
  // Get all tickets
  fastify.get(
    "/",
    {
      preHandler: authenticateJWT,
      schema: {
        tags: ["tickets"],
        summary: "Get all tickets",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                description: { type: "string", nullable: true },
                status: { type: "string" },
                priority: { type: "string" },
                serviceId: { type: "string" },
                departmentId: { type: "string" },
                citizenId: { type: "string" },
                tenantId: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
                service: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    type: { type: "string" },
                  },
                  required: ["id", "title", "type"],
                },
                department: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                  },
                  required: ["id", "name"],
                },
                citizen: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    email: { type: "string" },
                  },
                  required: ["id", "email"],
                },
              },
              required: [
                "id",
                "title",
                "status",
                "priority",
                "serviceId",
                "departmentId",
                "citizenId",
                "tenantId",
                "createdAt",
                "updatedAt",
              ],
            },
          },
        },
      },
    },
    async (request, reply) => {
      const tickets = await prisma.ticket.findMany({
        include: {
          service: {
            select: {
              id: true,
              title: true,
              type: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          citizen: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return tickets;
    }
  );

  // Get ticket by ID
  fastify.get(
    "/:id",
    {
      preHandler: authenticateJWT,
      schema: {
        tags: ["tickets"],
        summary: "Get ticket by ID",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              description: { type: "string", nullable: true },
              status: { type: "string" },
              priority: { type: "string" },
              serviceId: { type: "string" },
              departmentId: { type: "string" },
              citizenId: { type: "string" },
              tenantId: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
              service: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  type: { type: "string" },
                },
                required: ["id", "title", "type"],
              },
              department: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                },
                required: ["id", "name"],
              },
              citizen: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  email: { type: "string" },
                },
                required: ["id", "email"],
              },
              history: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    status: { type: "string" },
                    comment: { type: "string", nullable: true },
                    createdAt: { type: "string", format: "date-time" },
                  },
                  required: ["id", "status", "createdAt"],
                },
              },
            },
            required: [
              "id",
              "title",
              "status",
              "priority",
              "serviceId",
              "departmentId",
              "citizenId",
              "tenantId",
              "createdAt",
              "updatedAt",
            ],
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: {
          service: {
            select: {
              id: true,
              title: true,
              type: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          citizen: {
            select: {
              id: true,
              email: true,
            },
          },
          history: {
            include: {
              actor: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
            orderBy: { at: "desc" },
          },
        },
      });

      if (!ticket) {
        return reply.status(404).send({ error: "Ticket not found" });
      }

      return ticket;
    }
  );

  // Create ticket
  fastify.post(
    "/",
    {
      preHandler: authenticateJWT,
      schema: {
        tags: ["tickets"],
        summary: "Create a new ticket",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            title: { type: "string", minLength: 1 },
            description: { type: "string" },
            serviceId: { type: "string" },
            departmentId: { type: "string" },
            citizenId: { type: "string" },
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "urgent"],
            },
          },
          required: ["title", "serviceId", "departmentId", "citizenId"],
        },
        response: {
          201: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              description: { type: "string", nullable: true },
              status: { type: "string" },
              priority: { type: "string" },
              serviceId: { type: "string" },
              departmentId: { type: "string" },
              citizenId: { type: "string" },
              tenantId: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
              service: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  type: { type: "string" },
                },
                required: ["id", "title", "type"],
              },
              department: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                },
                required: ["id", "name"],
              },
              citizen: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  email: { type: "string" },
                },
                required: ["id", "email"],
              },
            },
            required: [
              "id",
              "title",
              "status",
              "priority",
              "serviceId",
              "departmentId",
              "citizenId",
              "tenantId",
              "createdAt",
              "updatedAt",
            ],
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const ticketData = request.body as CreateTicketInput;

      try {
        const createData: any = {
          tenantId: "default-tenant", // In a real app, this would come from auth context
          serviceId: ticketData.serviceId,
          citizenId: ticketData.citizenId,
          payload: ticketData.payload,
          geo: ticketData.geo,
        };

        // Only add departmentId if it's provided
        if (ticketData.departmentId) {
          createData.departmentId = ticketData.departmentId;
        }

        const ticket = await prisma.ticket.create({
          data: createData,
          include: {
            service: {
              select: {
                id: true,
                title: true,
                type: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
              },
            },
            citizen: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        });

        // Create initial status history
        await prisma.ticketStatusHistory.create({
          data: {
            ticketId: ticket.id,
            to: "RECEIVED",
          },
        });

        return reply.status(201).send(ticket);
      } catch (error) {
        return reply.status(400).send({ error: "Failed to create ticket" });
      }
    }
  );

  // Update ticket
  fastify.put(
    "/:id",
    {
      preHandler: authenticateJWT,
      schema: {
        tags: ["tickets"],
        summary: "Update ticket",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: {
            title: { type: "string", minLength: 1 },
            description: { type: "string" },
            status: {
              type: "string",
              enum: ["open", "in_progress", "resolved", "closed"],
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "urgent"],
            },
            serviceId: { type: "string" },
            departmentId: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              description: { type: "string", nullable: true },
              status: { type: "string" },
              priority: { type: "string" },
              serviceId: { type: "string" },
              departmentId: { type: "string" },
              citizenId: { type: "string" },
              tenantId: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
              service: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  type: { type: "string" },
                },
                required: ["id", "title", "type"],
              },
              department: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                },
                required: ["id", "name"],
              },
              citizen: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  email: { type: "string" },
                },
                required: ["id", "email"],
              },
            },
            required: [
              "id",
              "title",
              "status",
              "priority",
              "serviceId",
              "departmentId",
              "citizenId",
              "tenantId",
              "createdAt",
              "updatedAt",
            ],
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const updateData = request.body as UpdateTicketInput;

      try {
        const currentTicket = await prisma.ticket.findUnique({
          where: { id },
          select: { status: true },
        });

        if (!currentTicket) {
          return reply.status(404).send({ error: "Ticket not found" });
        }

        const updateFields: any = {};

        // Only include fields that are provided
        if (updateData.citizenId !== undefined)
          updateFields.citizenId = updateData.citizenId;
        if (updateData.payload !== undefined)
          updateFields.payload = updateData.payload;
        if (updateData.geo !== undefined) updateFields.geo = updateData.geo;
        if (updateData.status !== undefined)
          updateFields.status = updateData.status;

        // Handle departmentId separately to avoid undefined issues
        if (updateData.departmentId !== undefined) {
          updateFields.departmentId = updateData.departmentId;
        }

        const ticket = await prisma.ticket.update({
          where: { id },
          data: updateFields,
          include: {
            service: {
              select: {
                id: true,
                title: true,
                type: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
              },
            },
            citizen: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        });

        // Create status history if status changed
        if (updateData.status && updateData.status !== currentTicket.status) {
          await prisma.ticketStatusHistory.create({
            data: {
              ticketId: id,
              from: currentTicket.status,
              to: updateData.status,
              byUserId: "system", // In a real app, this would come from auth context
            },
          });
        }

        return ticket;
      } catch (error) {
        return reply.status(404).send({ error: "Ticket not found" });
      }
    }
  );

  // Delete ticket (soft delete)
  fastify.delete(
    "/:id",
    {
      preHandler: authenticateJWT,
      schema: {
        tags: ["tickets"],
        summary: "Delete ticket (soft delete)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        await prisma.ticket.update({
          where: { id },
          data: { status: "CANCELED" },
        });

        return { message: "Ticket deleted successfully" };
      } catch (error) {
        return reply.status(404).send({ error: "Ticket not found" });
      }
    }
  );
}
