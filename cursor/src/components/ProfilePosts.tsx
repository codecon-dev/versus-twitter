"use client";

import { useEffect, useState } from "react";
import { PostCard } from "./PostCard";

type Post = {
  id: string;
  content: string;
  mediaUrl: string | null;
  createdAt: string;
  author: { id: string; username: string; displayName: string | null; avatarUrl: string | null };
  retweetOf?: {
    id: string;
    content: string;
    mediaUrl: string | null;
    author: { id: string; username: string; displayName: string | null; avatarUrl: string | null };
  } | null;
  _count: { likes: number };
  liked?: boolean;
};

export function ProfilePosts({ username }: { username: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  async function load(cursor?: string) {
    if (cursor) setLoadingMore(true);
    const url = cursor ? `/api/users/${username}/posts?cursor=${cursor}` : `/api/users/${username}/posts`;
    const res = await fetch(url);
    const j = await res.json();
    if (j.data?.posts) {
      setPosts((prev) => (cursor ? [...prev, ...j.data.posts] : j.data.posts));
      setNextCursor(j.data.nextCursor ?? null);
    }
    setLoading(false);
    setLoadingMore(false);
  }

  useEffect(() => {
    setLoading(true);
    load();
  }, [username]);

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando...</div>;
  if (posts.length === 0) return <div className="p-8 text-center text-gray-500">Nenhum post ainda.</div>;

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={{ ...post, liked: post.liked ?? false }} />
      ))}
      {nextCursor && (
        <div className="p-4 text-center border-b border-white/10">
          <button
            onClick={() => load(nextCursor)}
            disabled={loadingMore}
            className="text-[#1d9bf0] hover:underline disabled:opacity-50"
          >
            {loadingMore ? "Carregando..." : "Carregar mais"}
          </button>
        </div>
      )}
    </div>
  );
}
