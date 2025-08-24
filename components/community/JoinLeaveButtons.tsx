"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Stack, Snackbar, Alert } from "@mui/material";

export default function JoinLeaveButtons({
  communityId,
  meUserId,
  isMemberInitial,
}: {
  communityId: number;
  meUserId: number;
  isMemberInitial: boolean;
}) {
  const router = useRouter();
  const [isMember, setIsMember] = useState(isMemberInitial);
  const [msg, setMsg] = useState<string | null>(null);

  async function join() {
    const r = await fetch("/api/community/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ community_id: communityId, user_id: meUserId }),
    });
    const j = await r.json();
    if (j.ok) {
      setIsMember(true);
      setMsg("参加しました");
      router.refresh();
    } else {
      setMsg(`参加に失敗: ${j.error ?? "unknown"}`);
    }
  }

  async function leave() {
    const r = await fetch("/api/community/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ community_id: communityId, user_id: meUserId }),
    });
    const j = await r.json();
    if (j.ok) {
      setIsMember(false);
      setMsg("退会しました");
      router.refresh();
    } else {
      setMsg(`退会に失敗: ${j.error ?? "unknown"}`);
    }
  }

  return (
    <>
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        sx={{ px: { xs: 2, sm: 3 }, mb: 2 }}
      >
        {isMember ? (
          <Button variant="contained" color="error" onClick={leave}>
            退会する
          </Button>
        ) : (
          <Button variant="contained" onClick={join}>
            参加する
          </Button>
        )}
      </Stack>
      <Snackbar
        open={!!msg}
        autoHideDuration={2200}
        onClose={() => setMsg(null)}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={() => setMsg(null)}
          sx={{ width: "100%" }}
        >
          {msg}
        </Alert>
      </Snackbar>
    </>
  );
}
