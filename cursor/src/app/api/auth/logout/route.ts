import { apiSuccess } from "@/lib/api";

export async function POST() {
  const res = apiSuccess({ ok: true });
  res.cookies.set("token", "", { maxAge: 0, path: "/" });
  return res;
}
