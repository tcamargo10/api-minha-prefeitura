import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import {
  createUserSchema,
  updateUserSchema,
  userResponseSchema,
  userPiiSchema,
  CreateUserInput,
  UpdateUserInput,
  UserPiiInput,
} from "../schemas/user";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth";

const prisma = new PrismaClient();

export async function userRoutes(fastify: FastifyInstance) {
  // Get all users
  fastify.get(
    "/",
    {
      preHandler: authenticateJWT,
      schema: {
        tags: ["users"],
        summary: "Get all users",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                cpf: { type: "string" },
                email: { type: "string", nullable: true },
                phone: { type: "string", nullable: true },
                isActive: { type: "boolean" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
              },
              required: ["id", "cpf", "isActive", "createdAt", "updatedAt"],
            },
          },
        },
      },
    },
    async (request, reply) => {
      const users = await prisma.user.findMany({
        where: { isActive: true },
        select: {
          id: true,
          cpf: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return users;
    }
  );

  // Get user by ID
  fastify.get(
    "/:id",
    {
      preHandler: authenticateJWT,
      schema: {
        tags: ["users"],
        summary: "Get user by ID",
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
              cpfHash: { type: "string" },
              email: { type: "string", nullable: true },
              phone: { type: "string", nullable: true },
              isActive: { type: "boolean" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
            required: ["id", "cpf", "isActive", "createdAt", "updatedAt"],
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

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          cpf: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      return user;
    }
  );

  // Create user
  fastify.post(
    "/",
    {
      preHandler: authenticateJWT,
      schema: {
        tags: ["users"],
        summary: "Create a new user",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            cpf: { type: "string", minLength: 1 },
            passwordHash: { type: "string", minLength: 1 },
            email: { type: "string", format: "email" },
            phone: { type: "string" },
          },
          required: ["cpfHash", "passwordHash"],
        },
        response: {
          201: {
            type: "object",
            properties: {
              id: { type: "string" },
              cpfHash: { type: "string" },
              email: { type: "string", nullable: true },
              phone: { type: "string", nullable: true },
              isActive: { type: "boolean" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
            required: ["id", "cpf", "isActive", "createdAt", "updatedAt"],
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
      const userData = request.body as CreateUserInput;

      try {
        const user = await prisma.user.create({
          data: userData,
          select: {
            id: true,
            cpf: true,
            email: true,
            phone: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return reply.status(201).send(user);
      } catch (error) {
        return reply.status(400).send({ error: "Failed to create user" });
      }
    }
  );

  // Update user
  fastify.put(
    "/:id",
    {
      preHandler: authenticateJWT,
      schema: {
        tags: ["users"],
        summary: "Update user",
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
            email: { type: "string", format: "email" },
            phone: { type: "string" },
            isActive: { type: "boolean" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              cpfHash: { type: "string" },
              email: { type: "string", nullable: true },
              phone: { type: "string", nullable: true },
              isActive: { type: "boolean" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
            required: ["id", "cpf", "isActive", "createdAt", "updatedAt"],
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
      const updateData = request.body as UpdateUserInput;

      try {
        const user = await prisma.user.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            cpf: true,
            email: true,
            phone: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return user;
      } catch (error) {
        return reply.status(404).send({ error: "User not found" });
      }
    }
  );

  // Delete user (soft delete)
  fastify.delete(
    "/:id",
    {
      preHandler: authenticateJWT,
      schema: {
        tags: ["users"],
        summary: "Delete user (soft delete)",
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
        await prisma.user.update({
          where: { id },
          data: { isActive: false },
        });

        return { message: "User deleted successfully" };
      } catch (error) {
        return reply.status(404).send({ error: "User not found" });
      }
    }
  );

  // Create user PII
  fastify.post(
    "/:id/pii",
    {
      preHandler: authenticateJWT,
      schema: {
        tags: ["users"],
        summary: "Create user PII data",
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
            cpf: { type: "string", minLength: 11, maxLength: 11 },
            name: { type: "string", minLength: 2 },
            address: { type: "string" },
            city: { type: "string" },
            state: { type: "string" },
            zip: { type: "string" },
          },
          required: ["cpf", "name"],
        },
        response: {
          201: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
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
      const { id } = request.params as { id: string };
      const piiData = request.body as UserPiiInput;

      try {
        await prisma.userPII.create({
          data: {
            userId: id,
            ...piiData,
          },
        });

        return reply
          .status(201)
          .send({ message: "User PII created successfully" });
      } catch (error) {
        return reply.status(400).send({ error: "Failed to create user PII" });
      }
    }
  );
}
