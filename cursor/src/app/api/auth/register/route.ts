import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, username, password, displayName } = body;

    if (!email || !username || !password) {
      return apiError("Email, username e senha são obrigatórios", 422);
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username: username.toLowerCase() }] },
    });
    if (existing) {
      return apiError("Email ou username já em uso", 422);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        username: username.toLowerCase().replace(/\s/g, ""),
        passwordHash,
        displayName: displayName || username,
      },
    });

    return apiSuccess({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao criar conta";
    return apiError(message, 500);
  }
}
