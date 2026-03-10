"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    followersCount: number;
    followingCount: number;
    postsCount: number;
    isFollowing: boolean;
  };
  currentUserId: string;
};

export function ProfileHeader({ user, currentUserId }: Props) {
  const router = useRouter();
  const isOwnProfile = user.id === currentUserId;

  async function toggleFollow() {
    const method = user.isFollowing ? "DELETE" : "POST";
    const res = await fetch(`/api/users/follow/${user.id}`, { method });
    if (res.ok) router.refresh();
  }

  return (
    <div className="p-4 border-b border-gray-800">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-3xl">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            "👤"
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold">{user.displayName || user.username}</h1>
          <p className="text-gray-500">@{user.username}</p>
          {user.bio && <p className="mt-2 text-gray-300">{user.bio}</p>}
          <div className="flex gap-4 mt-2 text-sm text-gray-500">
            <span>{user.followersCount} seguidores</span>
            <span>{user.followingCount} seguindo</span>
            <span>{user.postsCount} posts</span>
          </div>
          <div className="flex gap-2 mt-3">
            {isOwnProfile ? (
              <Link
                href="/perfil/editar"
                className="px-4 py-2 rounded-full font-semibold border border-gray-600 hover:bg-gray-800"
              >
                Editar perfil
              </Link>
            ) : (
              <button
                onClick={toggleFollow}
                className={`px-4 py-2 rounded-full font-semibold ${
                  user.isFollowing
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {user.isFollowing ? "Deixar de seguir" : "Seguir"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
