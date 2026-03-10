import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return apiError("Email e senha são obrigatórios", 422);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return apiError("Email ou senha inválidos", 401);
    }

    const token = await signToken({ userId: user.id, username: user.username });
    const res = apiSuccess({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
      },
      token,
    });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch {
    return apiError("Erro ao fazer login", 500);
  }
}
