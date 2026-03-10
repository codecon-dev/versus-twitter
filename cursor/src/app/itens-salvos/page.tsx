import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Layout } from "@/components/Layout";
import { BookmarksFeed } from "@/components/BookmarksFeed";

export default async function ItensSalvosPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <Layout>
      <BookmarksFeed />
    </Layout>
  );
}
