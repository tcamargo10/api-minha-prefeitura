import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import {
  createTenantSchema,
  updateTenantSchema,
  tenantResponseSchema,
  CreateTenantInput,
  UpdateTenantInput,
} from "../schemas/tenant";
import { authenticateJWT } from "../middleware/auth";

const prisma = new PrismaClient();

export async function tenantRoutes(fastify: FastifyInstance) {
  // Get all tenants
  fastify.get(
    "/",
    {
      preHandler: authenticateJWT,
      schema: {
        tags: ["tenants"],
        summary: "Get all tenants",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                domain: { type: "string" },
                isActive: { type: "boolean" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
              },
              required: [
                "id",
                "name",
                "domain",
                "isActive",
                "createdAt",
                "updatedAt",
              ],
            },
          },
        },
      },
    },
    async (request, reply) => {
      const tenants = await prisma.tenant.findMany({
        where: { isActive: true },
      });
      return tenants;
    }
  );

  // Get tenant by ID
  fastify.get(
    "/:id",
    {
      preHandler: authenticateJWT,
      schema: {
        tags: ["tenants"],
        summary: "Get tenant by ID",
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
              domain: { type: "string" },
              isActive: { type: "boolean" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
            required: [
              "id",
              "name",
              "domain",
              "isActive",
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

      const tenant = await prisma.tenant.findUnique({
        where: { id },
      });

      if (!tenant) {
        return reply.status(404).send({ error: "Tenant not found" });
      }

      return tenant;
    }
  );

  // Create tenant
  fastify.post(
    "/",
    {
      preHandler: authenticateJWT,
      schema: {
        tags: ["tenants"],
        summary: "Create a new tenant",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 1 },
            domain: { type: "string", minLength: 1 },
          },
          required: ["name", "domain"],
        },
        response: {
          201: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              domain: { type: "string" },
              isActive: { type: "boolean" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
            required: [
              "id",
              "name",
              "domain",
              "isActive",
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
      const tenantData = request.body as CreateTenantInput;

      try {
        const tenant = await prisma.tenant.create({
          data: tenantData,
        });

        return reply.status(201).send(tenant);
      } catch (error) {
        return reply.status(400).send({ error: "Failed to create tenant" });
      }
    }
  );

  // Update tenant
  fastify.put(
    "/:id",
    {
      preHandler: authenticateJWT,
      schema: {
        tags: ["tenants"],
        summary: "Update tenant",
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
            domain: { type: "string", minLength: 1 },
            isActive: { type: "boolean" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              domain: { type: "string" },
              isActive: { type: "boolean" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
            required: [
              "id",
              "name",
              "domain",
              "isActive",
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
      const updateData = request.body as UpdateTenantInput;

      try {
        const tenant = await prisma.tenant.update({
          where: { id },
          data: updateData,
        });

        return tenant;
      } catch (error) {
        return reply.status(404).send({ error: "Tenant not found" });
      }
    }
  );

  // Delete tenant (soft delete)
  fastify.delete(
    "/:id",
    {
      preHandler: authenticateJWT,
      schema: {
        tags: ["tenants"],
        summary: "Delete tenant (soft delete)",
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
        await prisma.tenant.update({
          where: { id },
          data: { isActive: false },
        });

        return { message: "Tenant deleted successfully" };
      } catch (error) {
        return reply.status(404).send({ error: "Tenant not found" });
      }
    }
  );
}
