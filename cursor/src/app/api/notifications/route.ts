import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api";
import { getSession } from "@/lib/auth";

const PAGE_SIZE = 30;

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return apiError("Não autorizado", 401);

  const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined;

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    take: PAGE_SIZE + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: "desc" },
    include: {
      actor: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
  });

  const list = notifications.slice(0, PAGE_SIZE);
  const nextCursor = notifications.length > PAGE_SIZE ? list[list.length - 1]?.id : null;

  return apiSuccess({ notifications: list, nextCursor });
}
