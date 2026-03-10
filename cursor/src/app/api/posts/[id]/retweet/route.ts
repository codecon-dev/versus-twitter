import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api";
import { getSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return apiError("Não autorizado", 401);

  const { id: retweetOfId } = await params;
  const original = await prisma.post.findUnique({ where: { id: retweetOfId } });
  if (!original) return apiError("Post não encontrado", 404);

  const body = await req.json().catch(() => ({}));
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (original.authorId !== session.userId) {
    await prisma.notification.create({
      data: {
        userId: original.authorId,
        type: "retweet",
        actorId: session.userId,
        postId: retweetOfId,
      },
    });
  }
  const post = await prisma.post.create({
    data: {
      authorId: session.userId,
      retweetOfId,
      content,
    },
    include: {
      author: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
      retweetOf: {
        include: {
          author: {
            select: { id: true, username: true, displayName: true, avatarUrl: true },
          },
        },
      },
      _count: { select: { likes: true } },
    },
  });
  return apiSuccess(post);
}
