"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { IconComment, IconRetweet, IconHeart, IconChart, IconBookmark, IconShare } from "./Icons";

type Author = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

type Post = {
  id: string;
  content: string;
  mediaUrl: string | null;
  createdAt: string;
  author: Author;
  retweetOf?: {
    id: string;
    content: string;
    mediaUrl: string | null;
    author: Author;
  } | null;
  _count: { likes: number; retweets?: number };
  liked?: boolean;
  bookmarked?: boolean;
};

export function PostCard({
  post,
  showBookmarkAction,
  onUnbookmark,
}: {
  post: Post;
  showBookmarkAction?: boolean;
  onUnbookmark?: () => void;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteContent, setQuoteContent] = useState("");
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [bookmarked, setBookmarked] = useState(!!post.bookmarked);

  const author = post.author;
  const isRetweet = !!post.retweetOf;
  const displayContent = isRetweet ? post.retweetOf : post;
  const displayAuthor = isRetweet ? post.retweetOf!.author : author;
  const canDelete = user?.id === post.author.id;

  async function toggleLike() {
    const method = post.liked ? "DELETE" : "POST";
    const res = await fetch(`/api/posts/${post.id}/like`, { method });
    if (res.ok) router.refresh();
  }

  async function retweetSimple() {
    const res = await fetch(`/api/posts/${post.id}/retweet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      setShowQuoteModal(false);
      router.refresh();
    }
  }

  async function retweetWithQuote() {
    if (quoteSubmitting) return;
    setQuoteSubmitting(true);
    const res = await fetch(`/api/posts/${post.id}/retweet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: quoteContent.trim() }),
    });
    setQuoteSubmitting(false);
    if (res.ok) {
      setShowQuoteModal(false);
      setQuoteContent("");
      router.refresh();
    }
  }

  async function deletePost() {
    if (!confirm("Deletar este post?")) return;
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  async function toggleBookmark() {
    const method = bookmarked ? "DELETE" : "POST";
    const res = await fetch(`/api/posts/${post.id}/bookmark`, { method });
    if (res.ok) {
      setBookmarked(!bookmarked);
      if (bookmarked && showBookmarkAction) onUnbookmark?.();
      else router.refresh();
    }
  }

  return (
    <>
      <article className="p-4 border-b border-white/10 hover:bg-white/5 transition">
        {isRetweet && (
          <p className="text-gray-500 text-sm mb-1 ml-14">
            {author.displayName || author.username} retweetou
          </p>
        )}
        <div className="flex gap-3">
          <Link href={`/${displayAuthor.username}`} className="shrink-0">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
              {displayAuthor.avatarUrl ? (
                <img
                  src={displayAuthor.avatarUrl}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-xl">👤</span>
              )}
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/${displayAuthor.username}`}
                className="font-semibold hover:underline"
              >
                {displayAuthor.displayName || displayAuthor.username}
              </Link>
              <Link
                href={`/${displayAuthor.username}`}
                className="text-gray-500 text-sm hover:underline"
              >
                @{displayAuthor.username}
              </Link>
              <span className="text-gray-500 text-sm">
                · {new Date(post.createdAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-wrap break-words">{(displayContent ?? post).content}</p>
            {(displayContent ?? post).mediaUrl && (
              <img
                src={(displayContent ?? post).mediaUrl!}
                alt=""
                className="mt-2 rounded-2xl max-h-80 w-full object-cover border border-white/10"
              />
            )}
            <div className="flex items-center justify-between max-w-md mt-2 text-gray-500">
              <button
                onClick={toggleLike}
                className={`flex items-center gap-1.5 hover:text-red-500 transition ${post.liked ? "text-red-500" : ""}`}
              >
                <IconHeart filled={post.liked} />
                <span>{post._count.likes || ""}</span>
              </button>
              <button
                onClick={() => setShowQuoteModal(true)}
                className="flex items-center gap-1.5 hover:text-green-500 transition"
              >
                <IconRetweet />
                <span>Retweet</span>
              </button>
              <button type="button" className="flex items-center gap-1.5 hover:text-[#1d9bf0] transition opacity-60">
                <IconChart />
                <span></span>
              </button>
              <button
                type="button"
                onClick={toggleBookmark}
                className={`flex items-center gap-1.5 transition ${bookmarked ? "text-[#1d9bf0]" : "hover:text-[#1d9bf0] opacity-80"}`}
                title={bookmarked ? "Remover dos salvos" : "Salvar"}
              >
                <IconBookmark />
              </button>
              <button type="button" className="flex items-center gap-1.5 hover:text-[#1d9bf0] transition opacity-60">
                <IconShare />
              </button>
              {canDelete && (
                <button
                  onClick={deletePost}
                  className="flex items-center gap-1 hover:text-red-600"
                  title="Deletar post"
                >
                  Deletar
                </button>
              )}
            </div>
          </div>
        </div>
      </article>

      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-black border border-white/20 rounded-2xl max-w-md w-full p-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Retweet</h3>
              <button
                type="button"
                onClick={() => { setShowQuoteModal(false); setQuoteContent(""); }}
                className="text-gray-500 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-gray-500 text-sm mb-2">Adicione um comentário (opcional)</p>
            <textarea
              value={quoteContent}
              onChange={(e) => setQuoteContent(e.target.value)}
              placeholder="O que você acha?"
              className="w-full bg-white/10 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] mb-4"
              rows={3}
              maxLength={280}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={retweetSimple}
                className="px-4 py-2 rounded-full font-semibold bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white"
              >
                Só retweetar
              </button>
              <button
                type="button"
                onClick={retweetWithQuote}
                disabled={quoteSubmitting}
                className="px-4 py-2 rounded-full font-semibold bg-white text-black hover:bg-gray-200 disabled:opacity-50"
              >
                {quoteSubmitting ? "Enviando..." : "Retweetar com comentário"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
