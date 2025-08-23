import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getPublicImageUrl } from "@/lib/supabase/image";
import CommunityDetail from "@/components/community/CommunityDetail";
import type { Community } from "@/types/community";

import SlackChat from "@/components/community/SlackChat ";
import OAuth from "@/components/community/OAuth";

export default async function Community(props: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await props.params;
  const num = Number(id);
  if (!Number.isFinite(num)) notFound();
  const { data, error } = await supabase
    .from("community")
    .select("*")
    .eq("id", num)
    .maybeSingle<Community>();

  if (error) {
    return <p>読み込み失敗： {error.message}</p>;
  }
  if (!data) {
    return notFound();
  }

  const imageUrl = data.image_path
    ? await getPublicImageUrl(data.image_path, "user-images")
    : undefined;

  const cookieStore = await cookies();
  const hasSlackAuth = !!cookieStore.get("slack_user_token")?.value;

  return (
    <>
      <CommunityDetail community={data} imageUrl={imageUrl} />
      {hasSlackAuth ? <SlackChat /> : <OAuth />}
    </>
  );
}
