import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Layout } from "@/components/Layout";
import { IconMail } from "@/components/Icons";

export default async function MensagensPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <Layout>
      <div className="sticky top-0 z-10 bg-[#0f0f0f]/95 backdrop-blur border-b border-white/10 px-4 py-3">
        <h1 className="text-xl font-bold">Mensagens</h1>
      </div>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
          <IconMail />
        </div>
        <h2 className="text-xl font-bold mb-2">Em breve</h2>
        <p className="text-gray-500 max-w-sm">
          As mensagens diretas estão em desenvolvimento. Você poderá conversar em privado com outros usuários em breve.
        </p>
      </div>
    </Layout>
  );
}
