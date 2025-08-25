import { getMe } from "@/lib/supabase/me";
import { redirect } from "next/navigation";

export default async function MyPage() {
  const me = await getMe();
  if (!me) redirect("/login");

  return (
    <>
      <h1>Hello MyPage</h1>
      <p>私の名前は{me.name}です</p>
    </>
  );
}
