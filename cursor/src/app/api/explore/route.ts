import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api";
import { getSession } from "@/lib/auth";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return apiError("Não autorizado", 401);

  const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined;

  const posts = await prisma.post.findMany({
    where: { retweetOfId: null },
    take: PAGE_SIZE + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      retweetOf: {
        include: {
          author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        },
      },
      _count: { select: { likes: true, retweets: true } },
      likes: session ? { where: { userId: session.userId }, select: { userId: true } } : false,
    },
  });

  const withScore = posts.map((p) => ({
    ...p,
    _score: p._count.likes * 2 + p._count.retweets * 3,
  }));
  withScore.sort((a, b) => b._score - a._score);

  const list = withScore.slice(0, PAGE_SIZE).map(({ _score, ...p }) => p);
  const nextCursor = posts.length > PAGE_SIZE ? list[list.length - 1]?.id : null;

  const result = list.map((p) => {
    const { likes, ...rest } = p;
    const liked = Array.isArray(likes) ? likes.length > 0 : false;
    return { ...rest, liked };
  });

  return apiSuccess({ posts: result, nextCursor });
}
