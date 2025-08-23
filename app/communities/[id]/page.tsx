import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

import { getPublicImageUrl } from "@/lib/supabase/image";
import CommunityDetail from "@/components/community/CommunityDetail";
import type { Community } from "@/types/community";

type PageProps = {
  params: { id: string };
};

export default async function Community({ params }: PageProps) {
  const supabase = await createClient();
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();
  const { data, error } = await supabase
    .from("community")
    .select("*")
    .eq("id", id)
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

  return <CommunityDetail community={data} imageUrl={imageUrl} />;
}
