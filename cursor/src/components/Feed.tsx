"use client";

import { useEffect, useState } from "react";
import { PostCard } from "./PostCard";
import { useAuth } from "./AuthProvider";
import { IconImage } from "./Icons";

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

type Tab = "for_you" | "following";

export function Feed() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("for_you");
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [postError, setPostError] = useState("");

  async function loadFeed(cursor?: string) {
    if (cursor) setLoadingMore(true);
    const params = new URLSearchParams({ tab });
    if (cursor) params.set("cursor", cursor);
    const res = await fetch(`/api/feed?${params}`);
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
    loadFeed();
  }, [tab]);

  async function handleUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/upload/post", { method: "POST", body: fd });
    const j = await res.json();
    if (j.data?.url) setMediaUrl(j.data.url);
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if ((!newPost.trim() && !mediaUrl) || submitting) return;
    setPostError("");
    setSubmitting(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newPost.trim() || "", mediaUrl }),
    });
    const j = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setPostError(j.error || "Erro ao postar");
      return;
    }
    if (j.data) {
      setPosts((prev) => [j.data, ...prev]);
      setNewPost("");
      setMediaUrl(null);
    }
  }

  return (
    <>
      <div className="sticky top-0 z-10 bg-[#0f0f0f]/95 backdrop-blur border-b border-white/10">
        <div className="flex">
          <button
            type="button"
            onClick={() => setTab("for_you")}
            className={`flex-1 py-4 font-semibold hover:bg-white/5 transition ${
              tab === "for_you" ? "border-b-2 border-[#1d9bf0]" : "text-gray-500"
            }`}
          >
            Para você
          </button>
          <button
            type="button"
            onClick={() => setTab("following")}
            className={`flex-1 py-4 font-semibold hover:bg-white/5 transition ${
              tab === "following" ? "border-b-2 border-[#1d9bf0]" : "text-gray-500"
            }`}
          >
            Seguindo
          </button>
        </div>
      </div>
      <div className="p-4 border-b border-white/10">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-600 shrink-0 flex items-center justify-center overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <span className="text-xl">👤</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="O que está acontecendo?"
              className="w-full bg-transparent border-b border-white/10 py-3 px-0 resize-none focus:outline-none focus:border-[#1d9bf0] placeholder-gray-500"
              rows={2}
              maxLength={280}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <label className="cursor-pointer text-[#1d9bf0] hover:bg-white/10 rounded-full p-2 transition">
                  <IconImage />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadImage}
                  />
                </label>
                {mediaUrl && (
                  <div className="relative inline-block">
                    <img src={mediaUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => setMediaUrl(null)}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-800 text-white text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${newPost.length >= 260 ? "text-orange-400" : "text-gray-500"}`}>
                  {newPost.length}/280
                </span>
                <button
                  type="submit"
                  disabled={(!newPost.trim() && !mediaUrl) || submitting}
                  className="bg-[#1d9bf0] text-white px-4 py-2 rounded-full font-semibold disabled:opacity-50 hover:bg-[#1a8cd8]"
                >
                  Postar
                </button>
              </div>
            </div>
            {postError && <p className="text-red-500 text-sm mt-1">{postError}</p>}
          </div>
        </form>
      </div>
      <div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando feed...</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {tab === "for_you"
              ? "Siga pessoas e interaja para ver posts aqui."
              : "Siga algumas pessoas para ver posts aqui."}
          </div>
        ) : (
          <>
            {posts.map((post) => <PostCard key={post.id} post={post} />)}
            {nextCursor && (
              <div className="p-4 text-center border-b border-white/10">
                <button
                  onClick={() => loadFeed(nextCursor)}
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
    </>
  );
}
