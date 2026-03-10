import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api";
import { getSession } from "@/lib/auth";

const SEED_USERNAMES = [
  "lunadev",
  "carlostech",
  "anacodes",
  "pedrostartup",
  "mariaux",
  "rafadata",
  "juliacriativa",
  "brunogames",
  "fernandabooks",
  "leomemes",
  "claraviagens",
  "diegomusic",
];

export async function POST() {
  const session = await getSession();
  if (!session) return apiError("Não autorizado", 401);

  const seedUsers = await prisma.user.findMany({
    where: { username: { in: SEED_USERNAMES } },
    select: { id: true },
  });

  let count = 0;
  for (const u of seedUsers) {
    if (u.id === session.userId) continue;
    await prisma.follow.upsert({
      where: {
        followerId_followedId: { followerId: session.userId, followedId: u.id },
      },
      create: { followerId: session.userId, followedId: u.id },
      update: {},
    });
    count++;
  }

  return apiSuccess({ followed: count, message: `Agora você segue ${count} usuários de exemplo. Atualize o feed.` });
}
