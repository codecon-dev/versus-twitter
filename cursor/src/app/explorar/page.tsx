import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Layout } from "@/components/Layout";
import { ExploreFeed } from "@/components/ExploreFeed";

export default async function ExplorarPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <Layout>
      <ExploreFeed />
    </Layout>
  );
}
