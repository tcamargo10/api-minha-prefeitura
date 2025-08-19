import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { PrismaClient } from "@prisma/client";
import config from "./config";

// Import routes
import { userRoutes } from "./routes/user";
import { tenantRoutes } from "./routes/tenant";
import { categoryRoutes } from "./routes/category";
import { serviceRoutes } from "./routes/service";
import { ticketRoutes } from "./routes/ticket";
import { cityhallRoutes } from "./routes/cityhall";

const prisma = new PrismaClient();

const fastify = Fastify({
  logger: {
    level: config.logLevel,
    transport: config.isProduction ? undefined : {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
});

// Register plugins
fastify.register(cors, {
  origin: true,
  credentials: true,
});

fastify.register(helmet);

fastify.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

// Swagger configuration
fastify.register(swagger, {
  swagger: {
    info: {
      title: "Minha Prefeitura API",
      description: "API para gerenciamento de solicitações da prefeitura",
      version: "1.0.0",
    },
    host: "localhost:3000",
    schemes: ["http"],
    consumes: ["application/json"],
    produces: ["application/json"],
    securityDefinitions: {
      bearerAuth: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
        description: "JWT token in format: Bearer <token>",
      },
    },
    tags: [
      { name: "users", description: "User management endpoints" },
      { name: "tenants", description: "Tenant management endpoints" },
      { name: "categories", description: "Service category endpoints" },
      { name: "services", description: "Service management endpoints" },
      { name: "tickets", description: "Ticket management endpoints" },
      { name: "cityhall", description: "City hall authentication and registration endpoints" },
    ],
  },
});

fastify.register(swaggerUi, {
  routePrefix: "/documentation",
  uiConfig: {
    docExpansion: "full",
    deepLinking: false,
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      next();
    },
    preHandler: function (request, reply, next) {
      next();
    },
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => {
    return swaggerObject;
  },
  transformSpecificationClone: true,
});

// Register routes
fastify.register(cityhallRoutes, { prefix: "/api/cityhall" });
fastify.register(userRoutes, { prefix: "/api/users" });
fastify.register(tenantRoutes, { prefix: "/api/tenants" });
fastify.register(categoryRoutes, { prefix: "/api/categories" });
fastify.register(serviceRoutes, { prefix: "/api/services" });
fastify.register(ticketRoutes, { prefix: "/api/tickets" });

// Health check endpoint
fastify.get("/health", async (request, reply) => {
  return { status: "OK", timestamp: new Date().toISOString() };
});

// Root endpoint
fastify.get("/", async (request, reply) => {
  return {
    message: "My City Hall API",
    version: "1.0.0",
    documentation: "/documentation",
  };
});

// Graceful shutdown
const gracefulShutdown = async () => {
  fastify.log.info("Shutting down gracefully...");
  await fastify.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: Number(config.port), host: config.host });

    fastify.log.info(`Server is running on http://${config.host}:${config.port}`);
    fastify.log.info(
      `Documentation available at http://${config.host}:${config.port}/documentation`
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
