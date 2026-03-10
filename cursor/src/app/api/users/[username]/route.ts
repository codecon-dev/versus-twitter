import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const session = await getSession();

  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      _count: { select: { followers: true, following: true, posts: true } },
    },
  });
  if (!user) return apiError("Usuário não encontrado", 404);

  let isFollowing = false;
  if (session) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followedId: { followerId: session.userId, followedId: user.id },
      },
    });
    isFollowing = !!follow;
  }

  return apiSuccess({
    ...user,
    followersCount: user._count.followers,
    followingCount: user._count.following,
    postsCount: user._count.posts,
    isFollowing,
  });
}
