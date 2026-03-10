import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api";
import { getSession } from "@/lib/auth";

const PAGE_SIZE = 20;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor") ?? undefined;
  const session = await getSession();

  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true },
  });
  if (!user) return apiError("Usuário não encontrado", 404);

  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    take: PAGE_SIZE + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: "desc" },
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
      ...(session && {
        likes: { where: { userId: session.userId }, select: { userId: true } },
      }),
    },
  });

  const nextCursor = posts.length > PAGE_SIZE ? posts[PAGE_SIZE - 1]?.id : null;
  const list = posts.slice(0, PAGE_SIZE).map((p) => {
    const { likes, ...rest } = p as typeof p & { likes?: { userId: string }[] };
    const liked = Array.isArray(likes) ? likes.length > 0 : false;
    return { ...rest, liked };
  });

  return apiSuccess({ posts: list, nextCursor });
}
