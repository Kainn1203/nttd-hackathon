import { getMe } from "@/lib/supabase/me";
import { redirect } from "next/navigation";

export default async function Home() {
  const me = await getMe();
  if (!me) redirect("/login");

  return (
    <main className="p-6 space-y-4">
      {/* <HeaderUser /> */}
      <div>
        <span>ID: {me.id}</span>
        <span>名前: {me.name}</span>
        <span>ハンドルネーム: {me?.handleName}</span>
        <span>出身: {me.origin}</span>
      </div>
    </main>
  );
}
