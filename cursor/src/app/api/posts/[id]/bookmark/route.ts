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

  const { id: postId } = await params;
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return apiError("Post não encontrado", 404);

  await prisma.bookmark.upsert({
    where: { userId_postId: { userId: session.userId, postId } },
    create: { userId: session.userId, postId },
    update: {},
  });
  return apiSuccess({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return apiError("Não autorizado", 401);

  const { id: postId } = await params;
  await prisma.bookmark.deleteMany({
    where: { userId: session.userId, postId },
  });
  return apiSuccess({ ok: true });
}
