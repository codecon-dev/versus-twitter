import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api";
import { getSession } from "@/lib/auth";

const PAGE_SIZE = 20;
const INTERACTION_BOOST = 0.2; // peso extra para autores com quem você mais interage
const RECENCY_BONUS_HALFLIFE_HOURS = 24; // recência conta mais nas primeiras 24h

function hoursSince(date: Date): number {
  return (Date.now() - date.getTime()) / (1000 * 60 * 60);
}

function baseScore(likes: number, retweets: number, createdAt: Date): number {
  const hours = hoursSince(createdAt);
  return (likes * 2 + retweets * 3) / (1 + hours);
}

function recencyFactor(createdAt: Date): number {
  const hours = hoursSince(createdAt);
  return Math.exp(-(hours / RECENCY_BONUS_HALFLIFE_HOURS) * Math.LN2);
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return apiError("Não autorizado", 401);

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor") ?? undefined;
  const tab = searchParams.get("tab") ?? "following"; // "for_you" | "following"

  const following = await prisma.follow.findMany({
    where: { followerId: session.userId },
    select: { followedId: true },
  });
  const followingIds = following.map((f) => f.followedId);
  followingIds.push(session.userId);

  const isForYou = tab === "for_you";

  let interactionByAuthor: Record<string, number> = {};
  if (isForYou) {
    const [myLikes, myRetweets] = await Promise.all([
      prisma.like.findMany({
        where: { userId: session.userId },
        include: { post: { select: { authorId: true } } },
      }),
      prisma.post.findMany({
        where: { authorId: session.userId, retweetOfId: { not: null } },
        include: { retweetOf: { select: { authorId: true } } },
      }),
    ]);
    for (const l of myLikes) {
      const id = l.post.authorId;
      interactionByAuthor[id] = (interactionByAuthor[id] ?? 0) + 1;
    }
    for (const r of myRetweets) {
      const id = r.retweetOf?.authorId;
      if (id) interactionByAuthor[id] = (interactionByAuthor[id] ?? 0) + 2;
    }
  }

  const posts = await prisma.post.findMany({
    where: { authorId: { in: followingIds } },
    take: isForYou ? 100 : PAGE_SIZE + 1,
    ...(cursor && !isForYou && { cursor: { id: cursor }, skip: 1 }),
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
      _count: { select: { likes: true, retweets: true } },
      likes: session
        ? { where: { userId: session.userId }, select: { userId: true } }
        : false,
    },
  });

  let list: typeof posts;
  let nextCursor: string | null = null;

  if (isForYou) {
    const withScore = posts.map((p) => {
      const base = baseScore(p._count.likes, p._count.retweets, p.createdAt);
      const recency = recencyFactor(p.createdAt);
      const interactionBoost = 1 + INTERACTION_BOOST * (interactionByAuthor[p.authorId] ?? 0);
      const _score = base * (0.7 + 0.3 * recency) * interactionBoost;
      return { ...p, _score };
    });
    withScore.sort((a, b) => b._score - a._score);
    const paginated = withScore.slice(0, PAGE_SIZE);
    list = paginated.map(({ _score, ...p }) => p);
  } else {
    nextCursor = posts.length > PAGE_SIZE ? posts[PAGE_SIZE - 1]?.id : null;
    list = posts.slice(0, PAGE_SIZE);
  }

  const result = list.map((p) => {
    const { likes, ...rest } = p;
    const liked = Array.isArray(likes) ? likes.length > 0 : false;
    return { ...rest, liked };
  });

  return apiSuccess({ posts: result, nextCursor });
}
