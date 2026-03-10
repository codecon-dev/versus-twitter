"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  IconX,
  IconHome,
  IconExplore,
  IconBell,
  IconMail,
  IconBookmark,
  IconProfile,
  IconMore,
  IconSearch,
  IconMenu,
  IconClose,
} from "@/components/ui/Icons";

const navItem = "flex items-center gap-3 px-3 py-3 rounded-full hover:bg-white/10 transition w-fit text-left";

function FollowSeedButton() {
  const [loading, setLoading] = useState(false);
  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/users/follow-seed", { method: "POST" });
      const j = await res.json();
      if (j.data) window.location.reload();
    } finally {
      setLoading(false);
    }
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full py-2.5 rounded-full font-bold bg-[#1d9bf0] hover:bg-[#1a8cd8] disabled:opacity-50 text-white transition text-[15px]"
    >
      {loading ? "Seguindo…" : "Seguir usuários de exemplo"}
    </button>
  );
}

function NavContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const { user } = useAuth();
  return (
    <>
      <Link href="/" className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-white/10 transition mb-2" onClick={onLinkClick}>
        <IconX />
      </Link>
      <Link href="/" className={navItem} onClick={onLinkClick}>
        <IconHome />
        <span className="text-xl">Início</span>
      </Link>
      <Link href="/explorar" className={navItem} onClick={onLinkClick}>
        <IconExplore />
        <span className="text-xl">Explorar</span>
      </Link>
      <Link href="/notificacoes" className={navItem} onClick={onLinkClick}>
        <IconBell />
        <span className="text-xl">Notificações</span>
      </Link>
      <Link href="/mensagens" className={navItem} onClick={onLinkClick}>
        <IconMail />
        <span className="text-xl">Mensagens</span>
      </Link>
      <Link href="/itens-salvos" className={navItem} onClick={onLinkClick}>
        <IconBookmark />
        <span className="text-xl">Itens salvos</span>
      </Link>
      <Link href={user ? `/${user.username}` : "/"} className={navItem} onClick={onLinkClick}>
        <IconProfile />
        <span className="text-xl">Perfil</span>
      </Link>
      <button type="button" className={navItem + " opacity-60 cursor-default"}>
        <IconMore />
        <span className="text-xl">Mais</span>
      </button>
      <Link
        href="/"
        className="mt-4 w-[90%] py-3.5 rounded-full bg-[#1d9bf0] hover:bg-[#1a8cd8] font-bold text-lg text-white transition text-center block"
        onClick={onLinkClick}
      >
        Postar
      </Link>
      {user && (
        <div className="mt-auto mb-4 flex items-center gap-3 px-3 py-2 rounded-full hover:bg-white/10 transition w-fit">
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">👤</span>
            )}
          </div>
          <div className="flex-1 min-w-0 hidden xl:block">
            <p className="font-bold truncate">{user.displayName || user.username}</p>
            <p className="text-gray-500 text-sm truncate">@{user.username}</p>
          </div>
          <IconMore />
        </div>
      )}
    </>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#0f0f0f] text-white max-w-[1280px] mx-auto">
      {/* Mobile: header with hamburger */}
      <header className="sm:hidden flex items-center justify-between px-3 py-2 border-b border-white/10 sticky top-0 z-20 bg-[#0f0f0f]">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-full hover:bg-white/10 transition"
          aria-label="Abrir menu"
        >
          <IconMenu />
        </button>
        <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition">
          <IconX />
        </Link>
        <div className="w-10" />
      </header>

      {/* Mobile: overlay + drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="sm:hidden fixed inset-0 bg-black/60 z-30 transition"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden
          />
          <aside className="sm:hidden fixed left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-[#0f0f0f] z-40 flex flex-col px-2 py-4 overflow-y-auto">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition"
                aria-label="Fechar menu"
              >
                <IconClose />
              </button>
            </div>
            <NavContent onLinkClick={() => setMobileMenuOpen(false)} />
          </aside>
        </>
      )}

      {/* Left sidebar - desktop */}
      <aside className="hidden sm:flex flex-col w-[275px] px-2 sticky top-0 h-screen flex-shrink-0">
        <div className="flex flex-col gap-1 py-2">
          <NavContent />
        </div>
      </aside>

      {/* Center - main content */}
      <main className="flex-1 min-w-0 border-x border-white/10 min-h-screen">
        {children}
      </main>

      {/* Right sidebar */}
      <aside className="hidden lg:flex flex-col w-[350px] p-4 gap-4 sticky top-0 h-screen overflow-y-auto">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder="Buscar"
            className="w-full bg-white/10 rounded-full py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1d9bf0]"
          />
        </div>
        <div className="bg-white/5 rounded-2xl p-4">
          <h2 className="text-xl font-bold mb-3">Inscreva-se no Premium</h2>
          <p className="text-[15px] text-gray-300 mb-4">
            Assine para desbloquear novos recursos e apoiar criadores.
          </p>
          <button className="w-full py-2.5 rounded-full font-bold bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white transition">
            Inscrever-se
          </button>
        </div>
        <div className="bg-white/5 rounded-2xl overflow-hidden">
          <h2 className="text-xl font-bold p-4 pb-2">O que está acontecendo</h2>
          <div className="p-4 pt-0">
            <div className="py-3 border-b border-white/10">
              <p className="text-gray-500 text-sm">Entretenimento · Assunto do momento</p>
              <p className="font-bold">#exemplo</p>
              <p className="text-gray-500 text-sm">1.2K posts</p>
            </div>
            <div className="py-3 border-b border-white/10">
              <p className="text-gray-500 text-sm">Esportes · Assunto do momento</p>
              <p className="font-bold">#exemplo2</p>
              <p className="text-gray-500 text-sm">5K posts</p>
            </div>
            <Link href="#" className="block py-3 text-[#1d9bf0] text-[15px] hover:underline">
              Mostrar mais
            </Link>
          </div>
        </div>
        <div className="bg-white/5 rounded-2xl overflow-hidden">
          <h2 className="text-xl font-bold p-4 pb-2">Quem seguir</h2>
          <div className="p-4 pt-0">
            <p className="text-gray-500 text-sm mb-3">Siga usuários de exemplo para ver o feed cheio de publicações.</p>
            <FollowSeedButton />
          </div>
        </div>
      </aside>
    </div>
  );
}
