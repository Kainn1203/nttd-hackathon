"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import EventList from "@/components/events/EventList";
import CreateEventModal from "@/components/events/CreateEventModal";

import type { Event, NewEventForm } from "@/types/event";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
  Paper,
} from "@mui/material";

interface EventWithMembers extends Event {
  member_count?: number;
  is_member?: boolean;
  candidate_date?: [];
}

// ------- Hooks -------
const useEvents = () => {
  const [events, setEvents] = useState<EventWithMembers[]>([]);
  const [userEvents, setUserEvents] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      setError(null);

      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select(`*, event_members(count)`)
        .order("is_finalized", { ascending: false })
        .order("finalized_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (eventsError) {
        console.error("event select error:", eventsError);
        throw eventsError;
      }

      // B. RPCで人数
      const { data: counts, error: rErr } = await supabase.rpc(
        "get_member_counts"
      );
      if (rErr) {
        console.error("rpc get_member_counts error:", rErr);
        throw rErr;
      }

      // C. マージ
      const countMap = new Map<number, number>(
        (counts ?? []).map((row: any) => [
          Number(row.event_id),
          Number(row.member_count),
        ])
      );

      const eventsWithCount: EventWithMembers[] = await Promise.all(
        eventsData.map(async (e: any) => {
          const { data: candidateDates, error: dateError } = await supabase
            .from("candidate_date")
            .select("candidate_date")
            .eq("event_id", e.id)
            .order("candidate_date", { ascending: true });

          if (dateError) console.error("候補日取得エラー:", dateError);

          return {
            ...e,
            member_count:
              e.event_members?.[0]?.count ?? countMap.get(Number(e.id)) ?? 0,
            candidate_date: candidateDates?.map((d) => d.candidate_date) ?? [],
          };
        })
      );

      setEvents(eventsWithCount);
    } catch (e) {
      console.error("イベント取得エラー:", e);
      setError("イベントの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEvents = async (userId: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("event_members")
        .select("event_id")
        .eq("user_id", userId);
      if (error) throw error;
      setUserEvents(data?.map((d) => d.event_id) ?? []);
    } catch (e) {
      console.error("ユーザーイベント取得エラー:", e);
      setError("ユーザーのイベント情報取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return {
    events,
    userEvents,
    loading,
    error,
    fetchEvents,
    fetchUserEvents,
    setEvents,
    setUserEvents,
    setLoading,
  };
};

export default function EventsClient({
  meId,
  slackUserToken,
}: {
  meId: number;
  slackUserToken?: string;
}) {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newEvent, setNewEvent] = useState<NewEventForm>({
    name: "",
    description: "",
    location: "",
    deadline: null,
    max_participants: null,
    candidate_dates: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    events,
    userEvents,
    loading,
    error,
    fetchEvents,
    fetchUserEvents,
    setLoading,
  } = useEvents();

  useEffect(() => {
    fetchEvents();
    if (meId != null) {
      fetchUserEvents(meId);
    } else {
      if (loading) setLoading(false);
    }
  }, [meId]);

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (meId == null || !newEvent.name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const supabase = createClient();

      const eventData = {
        name: newEvent.name.trim(),
        description: newEvent.description.trim(),
        location: newEvent.location.trim(),
        max_participants: newEvent.max_participants,
        deadline: newEvent.deadline,
        owner_id: meId,
      };

      const { data: event, error: eventError } = await supabase
        .from("events")
        .insert([eventData])
        .select()
        .single();

      if (eventError) throw eventError;

      const { data: eventMember, error: memberError } = await supabase
        .from("event_members")
        .insert([{ event_id: event.id, user_id: meId }])
        .select()
        .single();

      if (memberError) throw memberError;

      const { data: candidate, error: dateError } = await supabase
        .from("candidate_date")
        .insert(
          newEvent.candidate_dates.map((date) => ({
            event_id: event.id,
            candidate_date: date,
          }))
        )
        .select("id");

      if (dateError) {
        console.error("候補日登録エラー:", dateError);
      } else if (candidate) {
        const { error: voteError } = await supabase.from("vote_date").insert(
          candidate.map((row) => ({
            event_member_id: eventMember.id,
            candidate_id: row.id,
            is_yes: true,
          }))
        );

        if (voteError) console.error("参加可否登録エラー:", voteError);
      }

      await fetchEvents();
      await fetchUserEvents(meId);

      setNewEvent({
        name: "",
        description: "",
        location: "",
        deadline: null,
        max_participants: null,
        candidate_dates: [],
      });

      setShowCreateForm(false);

      alert(`🎉 イベント「${newEvent.name.trim()}」が作成されました！`);
      router.push(`/events/${event.id}`);
    } catch (e: any) {
      alert("イベントの作成に失敗しました: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEventClick = (eventId: number) => {
    router.push(`/events/${eventId}`);
  };

  const safeEvents = (events ?? []).filter(
    (e): e is EventWithMembers => !!e && typeof e.id === "number"
  );

  const myEvents = safeEvents.filter((e) => userEvents.includes(e.id));
  const otherEvents = safeEvents.filter((e) => !userEvents.includes(e.id));

  const stats = {
    totalEvents: safeEvents.length,
    myEvents: myEvents.length,
    otherEvents: otherEvents.length,
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.50",
        }}
      >
        <Box textAlign="center">
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            読み込み中．．．
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.50",
        }}
      >
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error" variant="h6" gutterBottom>
            エラーが発生しました．
          </Typography>
          <Typography color="text.secondary" paragraph>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
          >
            再読み込み
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
      <Container maxWidth="lg">
        <Box
          mb={4}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              イベント
            </Typography>
            <Typography variant="body1" color="text.secondary" mt={1}>
              参加中: {stats.myEvents}個 ／ 全体: {stats.totalEvents}個
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<span style={{ fontSize: "1.5rem" }}>＋</span>}
            onClick={() => setShowCreateForm(true)}
          >
            新しいイベントを作成
          </Button>
        </Box>

        <EventList
          myEvents={myEvents}
          otherEvents={otherEvents}
          onEventClick={handleEventClick}
        />

        <CreateEventModal
          show={showCreateForm}
          newEvent={newEvent}
          onSubmit={createEvent}
          onClose={() => setShowCreateForm(false)}
          onChange={setNewEvent}
          isSubmitting={isSubmitting}
        />
      </Container>
    </Box>
  );
}
