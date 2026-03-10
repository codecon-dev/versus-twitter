import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Layout } from "@/components/Layout";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ProfilePosts } from "@/components/ProfilePosts";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      _count: { select: { followers: true, following: true, posts: true } },
    },
  });

  if (!user) redirect("/");

  let isFollowing = false;
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followedId: { followerId: session.userId, followedId: user.id },
    },
  });
  isFollowing = !!follow;

  return (
    <Layout>
      <ProfileHeader
        user={{
          ...user,
          followersCount: user._count.followers,
          followingCount: user._count.following,
          postsCount: user._count.posts,
          isFollowing,
        }}
        currentUserId={session.userId}
      />
      <ProfilePosts username={username} />
    </Layout>
  );
}
