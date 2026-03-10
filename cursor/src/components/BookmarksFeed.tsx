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
  _count: { likes: number; retweets?: number };
  liked?: boolean;
  bookmarked?: boolean;
};

export function BookmarksFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  async function load(cursor?: string) {
    if (cursor) setLoadingMore(true);
    const params = cursor ? `?cursor=${cursor}` : "";
    const res = await fetch(`/api/bookmarks${params}`);
    const j = await res.json();
    if (j.data) {
      setPosts((prev) => (cursor ? [...prev, ...j.data.posts] : j.data.posts));
      setNextCursor(j.data.nextCursor ?? null);
    }
    setLoading(false);
    setLoadingMore(false);
  }

  useEffect(() => {
    setLoading(true);
    load();
  }, []);

  return (
    <div>
      <div className="sticky top-0 z-10 bg-[#0f0f0f]/95 backdrop-blur border-b border-white/10 px-4 py-3">
        <h1 className="text-xl font-bold">Itens salvos</h1>
        <p className="text-gray-500 text-sm mt-0.5">Posts que você salvou</p>
      </div>
      {loading ? (
        <div className="p-8 text-center text-gray-500">Carregando...</div>
      ) : posts.length === 0 ? (
        <div className="p-8 text-center text-gray-500">Você ainda não salvou nenhum post.</div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              showBookmarkAction
              onUnbookmark={() => setPosts((prev) => prev.filter((p) => p.id !== post.id))}
            />
          ))}
          {nextCursor && (
            <div className="p-4 text-center border-b border-white/10">
              <button
                type="button"
                onClick={() => load(nextCursor)}
                disabled={loadingMore}
                className="text-[#1d9bf0] hover:underline disabled:opacity-50"
              >
                {loadingMore ? "Carregando..." : "Carregar mais"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
