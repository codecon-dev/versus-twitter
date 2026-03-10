import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return apiError("Não autorizado", 401);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      _count: { select: { followers: true, following: true } },
    },
  });
  if (!user) return apiError("Usuário não encontrado", 404);

  return apiSuccess({
    ...user,
    followersCount: user._count.followers,
    followingCount: user._count.following,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return apiError("Não autorizado", 401);

  const body = await req.json().catch(() => ({}));
  const { displayName, bio, avatarUrl } = body;

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: {
      ...(typeof displayName === "string" && { displayName }),
      ...(typeof bio === "string" && { bio }),
      ...(typeof avatarUrl === "string" && { avatarUrl }),
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
    },
  });
  return apiSuccess(user);
}
