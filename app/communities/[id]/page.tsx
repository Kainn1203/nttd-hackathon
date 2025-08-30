import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import CommunityDetail from "@/components/community/CommunityDetail";
import type { Community } from "@/types/community";
import { Alert, AlertTitle, Container, Box, Stack } from "@mui/material";

import SlackChat from "@/components/community/SlackChat ";
import OAuth from "@/components/community/OAuth";
import { getMe } from "@/lib/supabase/me";
import JoinLeaveButtons from "@/components/community/JoinLeaveButtons";
import MembersSidebar from "@/components/community/MembersSidebar";

type MemberView = { id: number; name: string; imageUrl?: string };
type UserRow = {
  id: number;
  last_name: string | null;
  first_name: string | null;
  image_path?: string | null;
};
type CommunityMemberRow = {
  user: UserRow | UserRow[] | null;
};

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
    return (
      <Alert severity="error">
        <AlertTitle>読み込みに失敗しました</AlertTitle>
        {error.message}
      </Alert>
    );
  }
  if (!data) {
    return notFound();
  }

  const imageUrl = data.image_path;
  const channelId = data.slack_channel_id;
  const cookieStore = await cookies();
  const hasSlackAuth = !!cookieStore.get("slack_user_token")?.value;

  const me = await getMe();
  if (!me) redirect("/login");
  const meId = me.id;

  // 自身の参加判定
  let isMember = false;
  if (me) {
    const { data: cm } = await supabase
      .from("community_members")
      .select("*")
      .eq("community_id", num)
      .eq("user_id", meId)
      .maybeSingle();
    isMember = !!cm;
  }

  // 他の参加者検索
  const { data: rows, error: rowsError } = await supabase
    .from("community_members")
    .select("user:user_id!inner (id, last_name, first_name, image_path)")
    .eq("community_id", num)
    .order("joined_at", { ascending: true });

  if (rowsError) {
    console.error("members join error:", rowsError);
  }

  const toDisplayName = (u: UserRow) => {
    const ln = u.last_name?.trim() ?? "";
    const fn = u.first_name?.trim() ?? "";
    const full_name = `${ln} ${fn}`.trim();
    return full_name || `unknown<id: ${u.id}>`;
  };

  const raw = await Promise.all(
    (rows ?? []).map(async (r: CommunityMemberRow) => {
      // user が配列で来ることがあるので正規化
      const u = Array.isArray(r.user) ? r.user[0] : r.user;
      if (!u) return null;

      return {
        id: u.id,
        name: toDisplayName(u),
        imageUrl,
      } as MemberView;
    })
  );

  const members: MemberView[] = raw.filter((m): m is MemberView => m !== null);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "3fr 1fr" },
          gap: 3,
          alignItems: "start",
        }}
      >
        {/* 左カラム */}
        <Stack spacing={2}>
          <CommunityDetail community={data} imageUrl={imageUrl} />
          {isMember ? (
            hasSlackAuth ? (
              channelId ? (
                <SlackChat channelId={channelId} />
              ) : (
                <Container maxWidth="md" sx={{ py: 2, px: 0 }}>
                  <Alert severity="info" variant="outlined">
                    <AlertTitle>Slack チャンネル未設定</AlertTitle>
                    このコミュニティに紐づく Slack チャンネルが未設定です。
                  </Alert>
                </Container>
              )
            ) : (
              <OAuth />
            )
          ) : null}
          <JoinLeaveButtons
            communityId={num}
            meUserId={meId}
            isMemberInitial={isMember}
          />
        </Stack>

        {/* 右カラム */}
        <Box>
          <MembersSidebar members={members} />
        </Box>
      </Box>
    </Container>
  );
}
