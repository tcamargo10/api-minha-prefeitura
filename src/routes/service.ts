import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import {
  createServiceSchema,
  updateServiceSchema,
  serviceResponseSchema,
  CreateServiceInput,
  UpdateServiceInput,
} from "../schemas/service";
import { authenticateJWT } from "../middleware/auth";

const prisma = new PrismaClient();

export async function serviceRoutes(fastify: FastifyInstance) {
  // Get all services
  fastify.get(
    "/",
    {
      preHandler: authenticateJWT,
      schema: {
        tags: ["services"],
        summary: "Get all services",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                description: { type: "string", nullable: true },
                icon: { type: "string", nullable: true },
                color: { type: "string", nullable: true },
                position: { type: "number" },
                isActive: { type: "boolean" },
                categoryId: { type: "string" },
                departmentId: { type: "string" },
                tenantId: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
                category: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                  },
                  required: ["id", "name"],
                },
                department: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                  },
                  required: ["id", "name"],
                },
              },
              required: [
                "id",
                "name",
                "position",
                "isActive",
                "categoryId",
                "departmentId",
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
      const services = await prisma.service.findMany({
        where: { isActive: true },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { position: "asc" },
      });
      return services;
    }
  );

  // Get service by ID
  fastify.get(
    "/:id",
    {
      preHandler: authenticateJWT,
      schema: {
        tags: ["services"],
        summary: "Get service by ID",
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
              name: { type: "string" },
              description: { type: "string", nullable: true },
              icon: { type: "string", nullable: true },
              color: { type: "string", nullable: true },
              position: { type: "number" },
              isActive: { type: "boolean" },
              categoryId: { type: "string" },
              departmentId: { type: "string" },
              tenantId: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
              category: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                },
                required: ["id", "name"],
              },
              department: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                },
                required: ["id", "name"],
              },
            },
            required: [
              "id",
              "name",
              "position",
              "isActive",
              "categoryId",
              "departmentId",
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

      const service = await prisma.service.findUnique({
        where: { id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!service) {
        return reply.status(404).send({ error: "Service not found" });
      }

      return service;
    }
  );

  // Create service
  fastify.post(
    "/",
    {
      preHandler: authenticateJWT,
      schema: {
        tags: ["services"],
        summary: "Create a new service",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 1 },
            description: { type: "string" },
            icon: { type: "string" },
            color: { type: "string" },
            position: { type: "number" },
            categoryId: { type: "string" },
            departmentId: { type: "string" },
          },
          required: ["name", "categoryId", "departmentId"],
        },
        response: {
          201: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              description: { type: "string", nullable: true },
              icon: { type: "string", nullable: true },
              color: { type: "string", nullable: true },
              position: { type: "number" },
              isActive: { type: "boolean" },
              categoryId: { type: "string" },
              departmentId: { type: "string" },
              tenantId: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
              category: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                },
                required: ["id", "name"],
              },
              department: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                },
                required: ["id", "name"],
              },
            },
            required: [
              "id",
              "name",
              "position",
              "isActive",
              "categoryId",
              "departmentId",
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
      const serviceData = request.body as CreateServiceInput;

      try {
        const service = await prisma.service.create({
          data: {
            ...serviceData,
            tenantId: "default-tenant", // In a real app, this would come from auth context
          },
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        return reply.status(201).send(service);
      } catch (error) {
        return reply.status(400).send({ error: "Failed to create service" });
      }
    }
  );

  // Update service
  fastify.put(
    "/:id",
    {
      preHandler: authenticateJWT,
      schema: {
        tags: ["services"],
        summary: "Update service",
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
            name: { type: "string", minLength: 1 },
            description: { type: "string" },
            icon: { type: "string" },
            color: { type: "string" },
            position: { type: "number" },
            categoryId: { type: "string" },
            departmentId: { type: "string" },
            isActive: { type: "boolean" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              description: { type: "string", nullable: true },
              icon: { type: "string", nullable: true },
              color: { type: "string", nullable: true },
              position: { type: "number" },
              isActive: { type: "boolean" },
              categoryId: { type: "string" },
              departmentId: { type: "string" },
              tenantId: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
              category: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                },
                required: ["id", "name"],
              },
              department: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                },
                required: ["id", "name"],
              },
            },
            required: [
              "id",
              "name",
              "position",
              "isActive",
              "categoryId",
              "departmentId",
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
      const updateData = request.body as UpdateServiceInput;

      try {
        const service = await prisma.service.update({
          where: { id },
          data: updateData,
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        return service;
      } catch (error) {
        return reply.status(404).send({ error: "Service not found" });
      }
    }
  );

  // Delete service (soft delete)
  fastify.delete(
    "/:id",
    {
      preHandler: authenticateJWT,
      schema: {
        tags: ["services"],
        summary: "Delete service (soft delete)",
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
        await prisma.service.update({
          where: { id },
          data: { isActive: false },
        });

        return { message: "Service deleted successfully" };
      } catch (error) {
        return reply.status(404).send({ error: "Service not found" });
      }
    }
  );
}
