"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Layout } from "@/components/Layout";

export default function EditarPerfilPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName || "");
    setBio(user.bio || "");
    setAvatarUrl(user.avatarUrl || "");
    setLoading(false);
  }, [user]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Envie uma imagem (JPEG, PNG, GIF ou WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Imagem deve ter no máximo 5MB.");
      return;
    }
    setError("");
    setAvatarFile(file);
    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/upload/avatar", { method: "POST", body: fd });
    const j = await res.json();
    setUploading(false);
    if (j.data?.url) setAvatarUrl(j.data.url);
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: displayName.trim() || null,
        bio: bio.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Erro ao salvar");
      return;
    }
    if (data.data) setUser({ ...user!, ...data.data });
    router.push(user ? `/${user.username}` : "/");
    router.refresh();
  }

  if (loading || !user) {
    return (
      <Layout>
        <div className="p-8 text-gray-500">Carregando...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 border-b border-white/10">
        <Link href={`/${user.username}`} className="text-[#1d9bf0] hover:underline text-sm">
          ← Voltar ao perfil
        </Link>
        <h1 className="text-xl font-bold mt-2">Editar perfil</h1>
      </div>
      <form onSubmit={handleSubmit} className="p-4 max-w-xl flex flex-col gap-4">
        <div>
          <label className="block text-sm text-gray-500 mb-1">Foto de perfil</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">👤</span>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 rounded-full font-semibold border border-white/30 hover:bg-white/10 disabled:opacity-50"
              >
                {uploading ? "Enviando..." : "Enviar foto"}
              </button>
              <p className="text-gray-500 text-xs mt-1">ou use a URL abaixo</p>
            </div>
          </div>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
            className="w-full mt-2 bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] placeholder-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Nome de exibição</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Seu nome"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] placeholder-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Conte um pouco sobre você"
            rows={3}
            maxLength={160}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] placeholder-gray-500"
          />
          <p className={`text-xs mt-1 ${bio.length >= 150 ? "text-orange-400" : "text-gray-500"}`}>
            {bio.length}/160
          </p>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="bg-white text-black py-2 px-4 rounded-full font-semibold w-fit disabled:opacity-50 hover:bg-gray-200"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </Layout>
  );
}
