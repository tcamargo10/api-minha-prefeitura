import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    cpf: string;
    roles: Array<{
      tenantId: string;
      tenantName: string;
      tenantSlug: string;
      role: string;
    }>;
  };
}

export async function authenticateJWT(
  request: AuthenticatedRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply
        .status(401)
        .send({ error: "Token de autenticação necessário" });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded.userId) {
      return reply.status(401).send({ error: "Token inválido" });
    }

    // Adicionar informações do usuário ao request
    request.user = {
      id: decoded.userId,
      cpf: decoded.cpf,
      roles: decoded.roles || [],
    };
  } catch (error) {
    return reply.status(401).send({ error: "Token inválido ou expirado" });
  }
}

export function generateJWT(userId: string, cpf: string, roles: any[]) {
  return jwt.sign(
    {
      userId,
      cpf,
      roles,
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}
