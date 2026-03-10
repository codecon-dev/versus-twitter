import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api";
import { getSession } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return apiError("Não autorizado", 401);

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return apiError("Post não encontrado", 404);
  if (post.authorId !== session.userId) return apiError("Sem permissão", 403);

  await prisma.post.delete({ where: { id } });
  return apiSuccess({ ok: true });
}
