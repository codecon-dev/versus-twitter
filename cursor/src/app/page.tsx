import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Layout } from "@/components/Layout";
import { Feed } from "@/components/Feed";

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <Layout>
      <Feed />
    </Layout>
  );
}
