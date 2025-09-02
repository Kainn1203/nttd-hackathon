import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import EventDetail from "@/components/events/EventDetail";
import type {
  Event,
  CandidateDate,
  VoteDate,
  EventMember,
} from "@/types/event";
import { Alert, AlertTitle, Container, Box, Stack } from "@mui/material";
import { getMe } from "@/lib/supabase/me";
import EventVoteForm from "@/components/events/EventVoteForm";
import EventResults from "@/components/events/EventResults";
import EventMembersSidebar from "@/components/events/EventMembersSidebar";
import SlackChannelInvite from "@/components/events/SlackChannelInvite";

type EventWithCandidates = Event & {
  candidates: CandidateDate[];
  members: EventMember[];
  votes: VoteDate[];
  participants_count: number;
};

type MemberView = { id: number; name: string; imageUrl?: string };
type UserRow = {
  id: number;
  last_name: string | null;
  first_name: string | null;
  image_path?: string | null;
};

export default async function EventPage(props: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await props.params;
  const num = Number(id);
  if (!Number.isFinite(num)) notFound();

  const me = await getMe();
  if (!me) redirect("/login");

  // イベント情報を取得
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", num)
    .maybeSingle<Event>();

  if (error) {
    return (
      <Alert severity="error">
        <AlertTitle>読み込みに失敗しました</AlertTitle>
        {error.message}
      </Alert>
    );
  }
  if (!event) {
    return notFound();
  }

  // イベントの候補日を取得
  const { data: candidates, error: candidatesError } = await supabase
    .from("candidate_date")
    .select("*")
    .eq("event_id", num)
    .order("candidate_date", { ascending: true });

  if (candidatesError) {
    console.error("Candidates fetch error:", candidatesError);
  }

  // イベントメンバーを取得
  const { data: members, error: membersError } = await supabase
    .from("event_members")
    .select("*")
    .eq("event_id", num);

  if (membersError) {
    console.error("Members fetch error:", membersError);
    // エラーの詳細をログに出力
    console.error("Error details:", {
      message: membersError.message,
      details: membersError.details,
      hint: membersError.hint,
      code: membersError.code,
    });

    // テーブルが存在しない場合は空配列を使用
    if (
      membersError.code === "PGRST116" ||
      membersError.message.includes("relation") ||
      membersError.message.includes("does not exist")
    ) {
      console.log("event_members table does not exist, using empty array");
    }
  }

  // イベントの投票を取得（event_member_id経由でフィルタリング）
  const memberIds = members?.map((m) => m.id) || [];
  const { data: votes, error: votesError } =
    memberIds.length > 0
      ? await supabase
          .from("vote_date")
          .select("*")
          .in("event_member_id", memberIds)
      : { data: [], error: null };

  if (votesError) {
    console.error("Votes fetch error:", votesError);
    // エラーの詳細をログに出力
    console.error("Votes error details:", {
      message: votesError.message,
      details: votesError.details,
      hint: votesError.hint,
      code: votesError.code,
    });
  }

  // 自身の投票を取得（event_member_id経由）
  const myMember = members?.find((m) => m.user_id === me.id);
  const { data: myVotes } = myMember
    ? await supabase
        .from("vote_date")
        .select("*")
        .eq("event_member_id", myMember.id)
    : { data: [] };

  // 参加者数を重複カウントしないよう修正
  const uniqueParticipants = new Set(
    members?.map((member) => member.user_id) || []
  );

  const eventWithCandidates: EventWithCandidates = {
    ...event,
    candidates: candidates || [],
    members: members || [],
    votes: votes || [],
    participants_count: uniqueParticipants.size,
  };

  // 参加者一覧を取得
  const { data: userRows, error: userRowsError } = await supabase
    .from("user")
    .select("id, last_name, first_name, image_path")
    .in("id", Array.from(uniqueParticipants));

  if (userRowsError) {
    console.error("Users fetch error:", userRowsError);
  }

  const toDisplayName = (u: UserRow) => {
    const ln = u.last_name?.trim() ?? "";
    const fn = u.first_name?.trim() ?? "";
    const full_name = `${ln} ${fn}`.trim();
    return full_name || `unknown<id: ${u.id}>`;
  };

  const memberViews: MemberView[] = (userRows || []).map((u: UserRow) => ({
    id: u.id,
    name: toDisplayName(u),
    imageUrl: u.image_path || undefined,
  }));

  // 主催者の情報を取得
  const { data: ownerData, error: ownerError } = await supabase
    .from("user")
    .select("id, last_name, first_name")
    .eq("id", event.owner_id)
    .single();

  if (ownerError) {
    console.error("Owner fetch error:", ownerError);
  }

  const ownerName = ownerData ? toDisplayName(ownerData) : "不明";

  const isOwner = event.owner_id === me.id;
  const isDeadlinePassed = new Date(event.deadline) < new Date();

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
          <EventDetail event={eventWithCandidates} ownerName={ownerName} />

          {event.is_finalized && (
            <SlackChannelInvite
              eventId={event.id}
              eventName={event.name}
              finalizedDate={event.finalized_date || ""}
              isParticipant={myMember !== undefined}
            />
          )}

          {!event.is_finalized && !isDeadlinePassed && (
            <EventVoteForm
              event={event}
              candidates={candidates || []}
              myVotes={myVotes || []}
              me={me}
            />
          )}

          <EventResults
            event={eventWithCandidates}
            isOwner={isOwner}
            isDeadlinePassed={isDeadlinePassed}
            members={memberViews}
          />
        </Stack>

        {/* 右カラム */}
        <Box>
          <EventMembersSidebar members={memberViews} />
        </Box>
      </Box>
    </Container>
  );
}
