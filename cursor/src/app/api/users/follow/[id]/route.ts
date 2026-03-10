import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api";
import { getSession } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return apiError("Não autorizado", 401);

  const { id: followedId } = await params;
  if (followedId === session.userId) return apiError("Não pode seguir a si mesmo", 422);

  const followed = await prisma.user.findUnique({ where: { id: followedId } });
  if (!followed) return apiError("Usuário não encontrado", 404);

  await prisma.follow.upsert({
    where: {
      followerId_followedId: { followerId: session.userId, followedId },
    },
    create: { followerId: session.userId, followedId },
    update: {},
  });
  await prisma.notification.create({
    data: {
      userId: followedId,
      type: "follow",
      actorId: session.userId,
    },
  });
  return apiSuccess({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return apiError("Não autorizado", 401);

  const { id: followedId } = await params;
  await prisma.follow.deleteMany({
    where: { followerId: session.userId, followedId },
  });
  return apiSuccess({ ok: true });
}
