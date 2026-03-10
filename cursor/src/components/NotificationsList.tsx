"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Notification = {
  id: string;
  type: string;
  postId: string | null;
  createdAt: string;
  actor: { id: string; username: string; displayName: string | null; avatarUrl: string | null } | null;
};

export function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  async function load(cursor?: string) {
    if (cursor) setLoadingMore(true);
    const params = cursor ? `?cursor=${cursor}` : "";
    const res = await fetch(`/api/notifications${params}`);
    const j = await res.json();
    if (j.data) {
      setNotifications((prev) => (cursor ? [...prev, ...j.data.notifications] : j.data.notifications));
      setNextCursor(j.data.nextCursor ?? null);
    }
    setLoading(false);
    setLoadingMore(false);
  }

  useEffect(() => {
    setLoading(true);
    load();
  }, []);

  const actionLabel = (n: Notification) => {
    if (n.type === "like") return "curtiu seu post";
    if (n.type === "retweet") return "retweetou seu post";
    if (n.type === "follow") return "começou a seguir você";
    return "";
  };

  return (
    <div>
      <div className="sticky top-0 z-10 bg-[#0f0f0f]/95 backdrop-blur border-b border-white/10 px-4 py-3">
        <h1 className="text-xl font-bold">Notificações</h1>
      </div>
      {loading ? (
        <div className="p-8 text-center text-gray-500">Carregando...</div>
      ) : notifications.length === 0 ? (
        <div className="p-8 text-center text-gray-500">Nenhuma notificação ainda.</div>
      ) : (
        <>
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.actor?.username ? `/${n.actor.username}` : "#"}
              className="flex gap-3 p-4 border-b border-white/10 hover:bg-white/5 transition"
            >
              <div className="w-10 h-10 rounded-full bg-gray-600 shrink-0 flex items-center justify-center overflow-hidden">
                {n.actor?.avatarUrl ? (
                  <img src={n.actor.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg">👤</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px]">
                  <span className="font-semibold">{n.actor?.displayName || n.actor?.username}</span>
                  <span className="text-gray-500"> @{n.actor?.username}</span>
                  <span className="text-gray-400"> {actionLabel(n)}</span>
                </p>
                <p className="text-gray-500 text-sm mt-0.5">
                  {new Date(n.createdAt).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </Link>
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
