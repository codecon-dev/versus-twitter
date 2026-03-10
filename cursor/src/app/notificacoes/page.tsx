import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Layout } from "@/components/Layout";
import { NotificationsList } from "@/components/NotificationsList";

export default async function NotificacoesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <Layout>
      <NotificationsList />
    </Layout>
  );
}
