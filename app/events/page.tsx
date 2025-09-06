import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getMe } from "@/lib/supabase/me";
import EventsClient from "@/components/events/EventsClient";

export default async function EventsPage() {
  const me = await getMe();
  if (!me) redirect("/login");

  // Slack認証トークンをサーバーサイドで取得
  const cookieStore = await cookies();
  const slackUserToken = cookieStore.get("slack_user_token")?.value;

  return <EventsClient meId={me.id} slackUserToken={slackUserToken} />;
}
