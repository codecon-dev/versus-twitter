import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api";
import { getSession } from "@/lib/auth";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return apiError("Não autorizado", 401);

  const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined;

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.userId },
    take: PAGE_SIZE + 1,
    ...(cursor && { cursor: { userId_postId: { userId: session.userId, postId: cursor } }, skip: 1 }),
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        include: {
          author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          retweetOf: {
            include: {
              author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            },
          },
          _count: { select: { likes: true, retweets: true } },
          likes: { where: { userId: session.userId }, select: { userId: true } },
        },
      },
    },
  });

  const posts = bookmarks.map((b) => {
    const p = b.post;
    const { likes, ...rest } = p;
    const liked = Array.isArray(likes) ? likes.length > 0 : false;
    return { ...rest, liked, bookmarked: true };
  });

  const nextCursor = bookmarks.length > PAGE_SIZE ? bookmarks[PAGE_SIZE - 1]?.postId : null;
  return apiSuccess({ posts: posts.slice(0, PAGE_SIZE), nextCursor });
}
