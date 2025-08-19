import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { 
  createCategorySchema, 
  updateCategorySchema, 
  categoryResponseSchema,
  CreateCategoryInput,
  UpdateCategoryInput
} from '../schemas/category';
import { authenticateJWT } from '../middleware/auth';

const prisma = new PrismaClient();

export async function categoryRoutes(fastify: FastifyInstance) {
  // Get all categories
  fastify.get('/', {
    preHandler: authenticateJWT,
    schema: {
      tags: ['categories'],
      summary: 'Get all categories',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string', nullable: true },
              icon: { type: 'string', nullable: true },
              color: { type: 'string', nullable: true },
              position: { type: 'number' },
              isActive: { type: 'boolean' },
              tenantId: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
            required: ['id', 'name', 'position', 'isActive', 'tenantId', 'createdAt', 'updatedAt'],
          },
        },
      },
    },
  }, async (request, reply) => {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
    });
    return categories;
  });

  // Get category by ID
  fastify.get('/:id', {
    preHandler: authenticateJWT,
    schema: {
      tags: ['categories'],
      summary: 'Get category by ID',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            icon: { type: 'string', nullable: true },
            color: { type: 'string', nullable: true },
            position: { type: 'number' },
            isActive: { type: 'boolean' },
            tenantId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'name', 'position', 'isActive', 'tenantId', 'createdAt', 'updatedAt'],
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return reply.status(404).send({ error: 'Category not found' });
    }

    return category;
  });

  // Create category
  fastify.post('/', {
    preHandler: authenticateJWT,
    schema: {
      tags: ['categories'],
      summary: 'Create a new category',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          icon: { type: 'string' },
          color: { type: 'string' },
          position: { type: 'number' },
        },
        required: ['name'],
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            icon: { type: 'string', nullable: true },
            color: { type: 'string', nullable: true },
            position: { type: 'number' },
            isActive: { type: 'boolean' },
            tenantId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'name', 'position', 'isActive', 'tenantId', 'createdAt', 'updatedAt'],
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const categoryData = request.body as CreateCategoryInput;

    try {
      const category = await prisma.category.create({
        data: {
          ...categoryData,
          tenantId: 'default-tenant', // In a real app, this would come from auth context
        },
      });

      return reply.status(201).send(category);
    } catch (error) {
      return reply.status(400).send({ error: 'Failed to create category' });
    }
  });

  // Update category
  fastify.put('/:id', {
    preHandler: authenticateJWT,
    schema: {
      tags: ['categories'],
      summary: 'Update category',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          icon: { type: 'string' },
          color: { type: 'string' },
          position: { type: 'number' },
          isActive: { type: 'boolean' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            icon: { type: 'string', nullable: true },
            color: { type: 'string', nullable: true },
            position: { type: 'number' },
            isActive: { type: 'boolean' },
            tenantId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'name', 'position', 'isActive', 'tenantId', 'createdAt', 'updatedAt'],
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const updateData = request.body as UpdateCategoryInput;

    try {
      const category = await prisma.category.update({
        where: { id },
        data: updateData,
      });

      return category;
    } catch (error) {
      return reply.status(404).send({ error: 'Category not found' });
    }
  });

  // Delete category (soft delete)
  fastify.delete('/:id', {
    preHandler: authenticateJWT,
    schema: {
      tags: ['categories'],
      summary: 'Delete category (soft delete)',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      await prisma.category.update({
        where: { id },
        data: { isActive: false },
      });

      return { message: 'Category deleted successfully' };
    } catch (error) {
      return reply.status(404).send({ error: 'Category not found' });
    }
  });
}
