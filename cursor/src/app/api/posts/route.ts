import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return apiError("Não autorizado", 401);

  const body = await req.json().catch(() => ({}));
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const mediaUrl = typeof body.mediaUrl === "string" ? body.mediaUrl : null;

  if (!content && !mediaUrl) return apiError("Conteúdo ou mídia é obrigatório", 422);
  if (content.length > 280) return apiError("Máximo 280 caracteres", 422);

  const post = await prisma.post.create({
    data: {
      authorId: session.userId,
      content: content || "",
      mediaUrl,
    },
    include: {
      author: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
      _count: { select: { likes: true } },
    },
  });
  return apiSuccess(post);
}
