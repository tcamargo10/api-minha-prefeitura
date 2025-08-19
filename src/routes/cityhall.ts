import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { loginSchema, LoginInput } from "../schemas/user";
import { generateJWT } from "../middleware/auth";

const prisma = new PrismaClient();

export async function cityhallRoutes(fastify: FastifyInstance) {
  // Login (Cidadãos e Funcionários)
  fastify.post(
    "/login",
    {
      schema: {
        tags: ["cityhall"],
        summary: "User login (Cidadãos e Funcionários)",
        body: {
          type: "object",
          properties: {
            cpf: { type: "string", minLength: 11, maxLength: 11 },
            password: { type: "string", minLength: 1 },
            tenantSlug: { type: "string" },
          },
          required: ["cpf", "password"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              token: { type: "string" },
              user: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  cpf: { type: "string" },
                  email: { type: "string", nullable: true },
                  phone: { type: "string", nullable: true },
                  isActive: { type: "boolean" },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                  pii: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                    },
                  },
                  roles: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        tenantId: { type: "string" },
                        tenantName: { type: "string" },
                        tenantSlug: { type: "string" },
                        role: {
                          type: "string",
                          enum: [
                            "SUPERADMIN",
                            "ADMIN",
                            "MANAGER",
                            "AGENT",
                            "CITIZEN",
                          ],
                        },
                      },
                      required: [
                        "tenantId",
                        "tenantName",
                        "tenantSlug",
                        "role",
                      ],
                    },
                  },
                },
                required: ["id", "cpf", "isActive", "createdAt", "updatedAt"],
              },
            },
          },
          401: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
          403: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const loginData = request.body as LoginInput & { tenantSlug?: string };

      // Buscar todos os usuários ativos para comparar CPF
      const users = await prisma.user.findMany({
        where: {
          isActive: true,
        },
        include: {
          pii: {
            select: {
              name: true,
            },
          },
          roles: {
            include: {
              tenant: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      // Encontrar o usuário correto comparando o CPF hashado
      let user = null;
      for (const u of users) {
        const isCpfValid = await bcrypt.compare(loginData.cpf, u.cpf);
        if (isCpfValid) {
          user = u;
          break;
        }
      }

      if (!user) {
        return reply.status(401).send({ error: "Credenciais inválidas" });
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(
        loginData.password,
        user.passwordHash
      );
      if (!isPasswordValid) {
        return reply.status(401).send({ error: "Credenciais inválidas" });
      }

      // Se tenantSlug foi especificado, filtrar apenas esse tenant
      let filteredRoles = user.roles;
      if (loginData.tenantSlug) {
        filteredRoles = user.roles.filter(
          (role) => role.tenant.slug === loginData.tenantSlug
        );
        if (filteredRoles.length === 0) {
          return reply
            .status(403)
            .send({ error: "Usuário não possui acesso a este município" });
        }
      }

      // Gerar JWT token
      const rolesForToken = filteredRoles.map((role) => ({
        tenantId: role.tenant.id,
        tenantName: role.tenant.name,
        tenantSlug: role.tenant.slug,
        role: role.role,
      }));

      const token = generateJWT(user.id, user.cpf, rolesForToken);

      const userResponse = {
        id: user.id,
        cpf: user.cpf,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        pii: user.pii ? { name: user.pii.name } : undefined,
        roles: filteredRoles.map((role) => ({
          tenantId: role.tenant.id,
          tenantName: role.tenant.name,
          tenantSlug: role.tenant.slug,
          role: role.role,
        })),
      };

      return {
        token,
        user: userResponse,
      };
    }
  );

  // Cadastrar Prefeitura (Município)
  fastify.post(
    "/register",
    {
      schema: {
        tags: ["cityhall"],
        summary: "Register new municipality (Prefeitura)",
        body: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 1 },
            slug: { type: "string", minLength: 1 },
            plan: { type: "string", enum: ["FREE", "COMPLETE"] },
            populationBand: {
              type: "string",
              enum: ["UP_TO_50K", "FROM_50K_TO_100K", "ABOVE_100K"],
            },
            branding: {
              type: "object",
              properties: {
                logo: { type: "string" },
                primaryColor: { type: "string" },
                namePublic: { type: "string" },
              },
            },
            adminUser: {
              type: "object",
              properties: {
                cpf: { type: "string", minLength: 1 },
                passwordHash: { type: "string", minLength: 1 },
                email: { type: "string", format: "email" },
                phone: { type: "string" },
                name: { type: "string", minLength: 2 },
              },
              required: ["cpf", "passwordHash", "name"],
            },
          },
          required: ["name", "slug", "adminUser"],
        },
        response: {
          201: {
            type: "object",
            properties: {
              message: { type: "string" },
              tenant: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  slug: { type: "string" },
                  plan: { type: "string" },
                  populationBand: { type: "string" },
                  isActive: { type: "boolean" },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                },
                required: [
                  "id",
                  "name",
                  "slug",
                  "plan",
                  "populationBand",
                  "isActive",
                  "createdAt",
                  "updatedAt",
                ],
              },
              adminUser: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  email: { type: "string", nullable: true },
                  phone: { type: "string", nullable: true },
                  isActive: { type: "boolean" },
                },
                required: ["id", "isActive"],
              },
            },
            required: ["message", "tenant", "adminUser"],
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
          409: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const data = request.body as {
        name: string;
        slug: string;
        plan?: "FREE" | "COMPLETE";
        populationBand?: "UP_TO_50K" | "FROM_50K_TO_100K" | "ABOVE_100K";
        branding?: {
          logo?: string;
          primaryColor?: string;
          namePublic?: string;
        };
        adminUser: {
          cpf: string;
          passwordHash: string;
          email?: string;
          phone?: string;
          name: string;
        };
      };

      try {
        // Verificar se o slug já existe
        const existingTenant = await prisma.tenant.findUnique({
          where: { slug: data.slug },
        });

        if (existingTenant) {
          return reply.status(409).send({
            error: "Já existe uma prefeitura cadastrada com este slug",
          });
        }

        // Criar o tenant (município)
        const tenant = await prisma.tenant.create({
          data: {
            name: data.name,
            slug: data.slug,
            plan: data.plan || "FREE",
            populationBand: data.populationBand || "UP_TO_50K",
            brandingJson: data.branding ? (data.branding as any) : undefined,
            isActive: true,
          },
        });

        // Hash do CPF e senha
        const cpfHash = await bcrypt.hash(data.adminUser.cpf, 10);
        const passwordHash = await bcrypt.hash(data.adminUser.passwordHash, 10);

        // Criar o usuário administrador
        const adminUser = await prisma.user.create({
          data: {
            cpf: cpfHash,
            passwordHash: passwordHash,
            email: data.adminUser.email,
            phone: data.adminUser.phone,
            isActive: true,
          },
        });

        // Criar dados PII do administrador
        await prisma.userPII.create({
          data: {
            userId: adminUser.id,
            cpf: data.adminUser.cpf, // CPF original (não hashado)
            name: data.adminUser.name,
          },
        });

        // Atribuir papel de ADMIN ao usuário no tenant
        await prisma.userTenantRole.create({
          data: {
            userId: adminUser.id,
            tenantId: tenant.id,
            role: "ADMIN",
          },
        });

        return reply.status(201).send({
          message: "Prefeitura cadastrada com sucesso",
          tenant: {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            plan: tenant.plan,
            populationBand: tenant.populationBand,
            isActive: tenant.isActive,
            createdAt: tenant.createdAt,
            updatedAt: tenant.updatedAt,
          },
          adminUser: {
            id: adminUser.id,
            email: adminUser.email,
            phone: adminUser.phone,
            isActive: adminUser.isActive,
          },
        });
      } catch (error) {
        console.error("Erro ao cadastrar prefeitura:", error);
        return reply.status(400).send({
          error: "Erro ao cadastrar prefeitura. Tente novamente.",
        });
      }
    }
  );
}
