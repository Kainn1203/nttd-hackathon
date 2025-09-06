// app/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMe } from "@/lib/supabase/me";
import { getPublicImageUrl } from "@/lib/supabase/image";
import { createClient } from "@/lib/supabase/server";

import {
  Box,
  Avatar,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Divider,
  Alert,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import {
  Groups as GroupsIcon,
  Person as PersonIcon,
  Forum as ForumIcon,
  Event as EventIcon,
  Psychology as PsychologyIcon,
} from "@mui/icons-material";

export const metadata = { title: "NTTデータ内定者向けコミュニティ" };

export default async function Home() {
  const me = await getMe();
  if (!me) redirect("/login");
  // 画像URL（フルURL or パス対応）
  let avatarUrl: string | undefined = undefined;
  if (me?.imagePath) {
    avatarUrl = me.imagePath.startsWith("http")
      ? me.imagePath
      : getPublicImageUrl("user-images", me.imagePath) ?? undefined;
  }
  // Supabaseクライアント
  const supabase = await createClient();

  // イベントのお知らせ（最新順に10件）
  const { data: eventAnnouncements } = await supabase
    .from("event_announcements")
    .select("id, description, created_at, event_id")
    .order("created_at", { ascending: false })
    .limit(10);

  // 紐づくイベント情報（location, deadline）をまとめて取得
  const eventIds = Array.from(
    new Set(
      (eventAnnouncements ?? [])
        .map((a: { event_id: number | null }) => a.event_id)
        .filter(Boolean)
    )
  ) as number[];
  const eventsById: Record<
    number,
    { location?: string | null; deadline?: string | null }
  > = {};
  if (eventIds.length > 0) {
    const { data: eventsRows } = await supabase
      .from("events")
      .select("id, location, deadline")
      .in("id", eventIds);
    (eventsRows ?? []).forEach(
      (e: {
        id: number;
        location?: string | null;
        deadline?: string | null;
      }) => {
        eventsById[e.id] = {
          location: e.location ?? null,
          deadline: e.deadline ?? null,
        };
      }
    );
  }

  // ユーザーの趣味（名前配列）
  const { data: userHobby } = await supabase
    .from("user_hobbies")
    .select("hobby_id")
    .eq("user_id", me.id)
    .order("hobby_id");
  let hobbyNames: string[] = [];
  if (userHobby && userHobby.length > 0) {
    const ids = userHobby.map((h: { hobby_id: number }) => h.hobby_id);
    const { data: hobbies } = await supabase
      .from("hobbies")
      .select("id, hobby")
      .in("id", ids);
    hobbyNames = (hobbies ?? []).map(
      (h: { id: number; hobby: string }) => h.hobby
    );
  }

  return (
    <main>
      {/* Hero：余白を小さめに、CTAを詰める */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          py: { xs: 6, md: 8 },
          mb: { xs: 3, md: 4 },
          background:
            "radial-gradient(900px 420px at 5% -10%, rgba(0,91,172,.14), transparent), radial-gradient(700px 500px at 100% 0%, rgba(0,191,166,.12), transparent)",
        }}
      >
        {/* 動くグラデーション（Heroセクションのみ） */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(60% 80% at 10% 0%, rgba(0,91,172,.28), transparent), radial-gradient(70% 80% at 90% -10%, rgba(0,191,166,.24), transparent), linear-gradient(120deg, rgba(0,91,172,.20), rgba(0,191,166,.20), rgba(131,56,236,.14))",
            backgroundSize: "auto, auto, 600% 600%",
            mixBlendMode: "normal",
            opacity: 0.98,
            filter: "saturate(1.15) contrast(1.05)",
            animation: "heroGradient 6s ease-in-out infinite",
          }}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Stack spacing={2} alignItems="flex-start">
            <Typography variant="overline" color="primary">
              ようこそ
            </Typography>

            {/* タイトルを少し小さめに */}
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                lineHeight: 1.15,
                fontSize: { xs: 28, sm: 36, md: 44 },
              }}
            >
              {me.name ?? "内定者"}さん、交流をもっとスムーズに
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 720 }}
            >
              コミュニティの発見、相互理解、コラボを後押しする内定者向けポータル。
              <br />
              プロフィールの作成からコミュニティ参加まで、ここから始めましょう。
            </Typography>

            {/* CTAボタン（内定者を探す/コミュニティを見る/自分のプロフィール）は一旦非表示にしました */}
          </Stack>
        </Container>
      </Box>

      {/* お知らせ（1つの枠で縦スクロール表示） */}
      <Container
        maxWidth="lg"
        disableGutters
        sx={{ px: { xs: 0, sm: 3 }, mb: 2 }}
      >
        <Alert
          icon={false}
          severity="info"
          variant="outlined"
          sx={{ borderRadius: 2, p: 0, overflow: "hidden" }}
        >
          <Box
            className="notice-scroll"
            sx={{
              maxHeight: 180,
              overflowY: "auto",
              py: 1,
              position: "relative",
              width: "100%",
            }}
          >
            {(eventAnnouncements ?? []).length > 0 ? (
              <Stack spacing={0} sx={{ width: "100%" }}>
                {eventAnnouncements!.map((a, idx) =>
                  a.event_id ? (
                    <Link
                      key={a.id}
                      href={`/events/${a.event_id}`}
                      style={{
                        display: "block",
                        width: "100%",
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          width: "100%",
                          px: 1.5,
                          py: 1,
                          cursor: "pointer",
                          borderBottom:
                            idx === eventAnnouncements!.length - 1
                              ? "none"
                              : "1px dotted",
                          borderColor: "divider",
                          transition: "background-color .15s ease",
                          "&:hover": { backgroundColor: "action.hover" },
                          "&:hover .ann-text": {
                            color: "primary.dark",
                            textDecorationThickness: "2px",
                            transform: "translateX(2px)",
                          },
                        }}
                      >
                        {/* 作成日時 */}
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ minWidth: { xs: 120, sm: 140 } }}
                        >
                          {a.created_at
                            ? new Date(a.created_at).toLocaleString("ja-JP")
                            : ""}
                        </Typography>
                        {/* 場所タグ（location） */}
                        {eventsById[a.event_id]?.location
                          ? (() => {
                              const loc = String(
                                eventsById[a.event_id]!.location
                              );
                              const color = /オンライン/i.test(loc)
                                ? "success"
                                : /東京/i.test(loc)
                                ? "info"
                                : "secondary";
                              return (
                                <Chip
                                  label={loc}
                                  size="small"
                                  color={
                                    color as
                                      | "default"
                                      | "primary"
                                      | "secondary"
                                      | "error"
                                      | "info"
                                      | "success"
                                      | "warning"
                                  }
                                  variant="outlined"
                                />
                              );
                            })()
                          : null}
                        {/* 本文 */}
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            textDecoration: "underline",
                            transition:
                              "color .15s ease, text-decoration-thickness .15s ease, transform .15s ease",
                            minWidth: 0,
                          }}
                          className="ann-text"
                          title={a.description || ""}
                        >
                          {a.description}
                        </Typography>
                        {/* テキストの後ろの可視スペース（右端の締切まで拡張） */}
                        <Box
                          sx={{ flexGrow: 1, pr: { xs: 1, sm: 2, md: 3 } }}
                        />
                        {/* 締切タグ（deadline） */}
                        {eventsById[a.event_id]?.deadline ? (
                          <Chip
                            label={`締切: ${new Date(
                              eventsById[a.event_id]!.deadline as string
                            ).toLocaleDateString("ja-JP")}`}
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        ) : null}
                      </Box>
                    </Link>
                  ) : (
                    <Box
                      key={a.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        width: "100%",
                        px: 1.5,
                        py: 1,
                        borderBottom:
                          idx === eventAnnouncements!.length - 1
                            ? "none"
                            : "1px dotted",
                        borderColor: "divider",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ minWidth: { xs: 120, sm: 140 } }}
                      >
                        {a.created_at
                          ? new Date(a.created_at).toLocaleString("ja-JP")
                          : ""}
                      </Typography>
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {a.description}
                      </Typography>
                    </Box>
                  )
                )}
              </Stack>
            ) : (
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  現在お知らせはありません
                </Typography>
              </Box>
            )}
          </Box>
        </Alert>
      </Container>

      {/* コンテンツ：BoxのCSS Gridでレイアウト */}
      <Container
        maxWidth="lg"
        disableGutters
        sx={{ pb: { xs: 6, md: 8 }, px: { xs: 0, sm: 3 } }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
            columnGap: { xs: 0, md: 3 },
            rowGap: { xs: 2, md: 3 },
            alignItems: "stretch",
          }}
        >
          <Box sx={{ gridColumn: { md: "1 / 2" }, gridRow: { md: "1" } }}>
            <Card
              sx={{
                height: "100%",
                background:
                  "linear-gradient(180deg, rgba(33,150,243,0.06) 0%, rgba(33,150,243,0.02) 100%)",
              }}
            >
              <CardActionArea
                component={Link}
                href="/members"
                aria-label="内定者一覧ページへ移動"
                sx={{
                  height: "100%",
                  "&:hover .card-icon": { transform: "scale(1.06)" },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={1.5}>
                    <Box
                      className="card-icon"
                      sx={{
                        display: "inline-flex",
                        transition: "transform .15s ease",
                        transformOrigin: "center",
                      }}
                    >
                      <GroupsIcon fontSize="large" color="primary" />
                    </Box>
                    <Typography variant="h6" fontWeight={800}>
                      内定者一覧
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      学部・興味・スキルで検索。
                      <br />
                      つながりを見つけよう。
                    </Typography>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>

          <Box sx={{ gridColumn: { md: "2 / 3" }, gridRow: { md: "1" } }}>
            <Card
              sx={{
                height: "100%",
                background:
                  "linear-gradient(180deg, rgba(33,150,243,0.06) 0%, rgba(33,150,243,0.02) 100%)",
              }}
            >
              <CardActionArea
                component={Link}
                href="/communities"
                aria-label="コミュニティページへ移動"
                sx={{
                  height: "100%",
                  "&:hover .card-icon": { transform: "scale(1.06)" },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={1.5}>
                    <Box
                      className="card-icon"
                      sx={{
                        display: "inline-flex",
                        transition: "transform .15s ease",
                        transformOrigin: "center",
                      }}
                    >
                      <ForumIcon fontSize="large" color="primary" />
                    </Box>
                    <Typography variant="h6" fontWeight={800}>
                      コミュニティ
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      サークル・PJ・勉強会など、興味ある場に参加しよう。
                    </Typography>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>

          {/* イベント */}
          <Box sx={{ gridColumn: { md: "3 / 4" }, gridRow: { md: "1" } }}>
            <Card
              sx={{
                height: "100%",
                background:
                  "linear-gradient(180deg, rgba(33,150,243,0.06) 0%, rgba(33,150,243,0.02) 100%)",
              }}
            >
              <CardActionArea
                component={Link}
                href="/events"
                aria-label="イベントページへ移動"
                sx={{
                  height: "100%",
                  "&:hover .card-icon": { transform: "scale(1.06)" },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={1.5}>
                    <Box
                      className="card-icon"
                      sx={{
                        display: "inline-flex",
                        transition: "transform .15s ease",
                        transformOrigin: "center",
                      }}
                    >
                      <EventIcon fontSize="large" color="primary" />
                    </Box>
                    <Typography variant="h6" fontWeight={800}>
                      イベント
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      勉強会や交流会などの最新イベントをチェック。
                    </Typography>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>

          {/* 社畜度診断（右端） */}
          <Box sx={{ gridColumn: { md: "4 / 5" }, gridRow: { md: "1" } }}>
            <Card
              sx={{
                height: "100%",
                background: "linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)",
                color: "common.white",
                "& .MuiTypography-body2": { color: "rgba(255,255,255,0.9)" },
              }}
            >
              <CardActionArea
                component={Link}
                href="/diagnosis"
                aria-label="社畜度診断ページへ移動"
                sx={{
                  height: "100%",
                  "&:hover .card-icon": { transform: "scale(1.06)" },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={1.5}>
                    <Box
                      className="card-icon"
                      sx={{
                        display: "inline-flex",
                        transition: "transform .15s ease",
                        transformOrigin: "center",
                        color: "inherit",
                      }}
                    >
                      <PsychologyIcon fontSize="large" color="inherit" />
                    </Box>
                    <Typography variant="h6" fontWeight={800}>
                      社畜度診断
                    </Typography>
                    <Typography variant="body2">
                      あなたの社畜度を5タイプで診断してみよう。
                    </Typography>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>

          {/* あなたのプロフィール（2段目・1行で配置） */}
          <Box sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}>
            <Card
              sx={{
                background:
                  "linear-gradient(180deg, rgba(33,150,243,0.06) 0%, rgba(33,150,243,0.02) 100%)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  あなたのプロフィール
                </Typography>
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{ mt: 0.5 }}
                >
                  <Avatar
                    src={avatarUrl}
                    alt={me.name ?? "プロフィール"}
                    sx={{ width: 40, height: 40 }}
                  />
                  <Typography variant="h6" fontWeight={800}>
                    {me.name ?? "未設定"}
                  </Typography>
                  <Box sx={{ flexGrow: 1 }} />
                </Stack>
                <Divider sx={{ my: 1.5 }} />
                <Stack spacing={0.5}>
                  <Typography variant="body2">
                    <strong>ID:</strong> {me.id}
                  </Typography>
                  {me?.handleName && (
                    <Typography variant="body2">
                      <strong>ハンドルネーム:</strong> {me.handleName}
                    </Typography>
                  )}
                  <Typography variant="body2">
                    <strong>出身:</strong> {me?.origin || "未設定"}
                  </Typography>
                  {me?.university && (
                    <Typography variant="body2">
                      <strong>大学:</strong> {me.university}
                    </Typography>
                  )}
                </Stack>
                {hobbyNames.length > 0 && (
                  <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    flexWrap="wrap"
                    sx={{ mt: 1 }}
                  >
                    {hobbyNames.map((name) => (
                      <Chip key={name} label={name} size="small" />
                    ))}
                  </Stack>
                )}
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ mt: 2 }}
                  useFlexGap
                  flexWrap="wrap"
                >
                  <Button
                    component={Link}
                    href="/myPage"
                    size="small"
                    variant="outlined"
                    startIcon={<PersonIcon />}
                  >
                    プロフィールを編集
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </main>
  );
}
