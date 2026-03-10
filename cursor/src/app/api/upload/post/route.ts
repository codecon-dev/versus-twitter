import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return apiError("Não autorizado", 401);

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file || !file.size) return apiError("Nenhum arquivo enviado", 422);

  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowed.includes(file.type)) return apiError("Tipo de arquivo não permitido", 422);
  if (file.size > 5 * 1024 * 1024) return apiError("Arquivo muito grande (máx 5MB)", 422);

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}-${session.userId.slice(-6)}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "posts");
  await mkdir(dir, { recursive: true });
  const filepath = path.join(dir, filename);
  const bytes = await file.arrayBuffer();
  await writeFile(filepath, Buffer.from(bytes));

  const url = `/uploads/posts/${filename}`;
  return apiSuccess({ url });
}
