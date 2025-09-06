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
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import ForumIcon from "@mui/icons-material/Forum";

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
  // ユーザーの趣味（名前配列）
  const supabase = await createClient();
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
    hobbyNames = (hobbies ?? []).map((h: { id: number; hobby: string }) => h.hobby);
  }

  return (
    <main>
      {/* Hero：余白を小さめに、CTAを詰める */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          mb: { xs: 3, md: 4 },
          background:
            "radial-gradient(900px 420px at 5% -10%, rgba(0,91,172,.14), transparent), radial-gradient(700px 500px at 100% 0%, rgba(0,191,166,.12), transparent)",
        }}
      >
        <Container maxWidth="lg">
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
              {me.name ?? "内定者"}さん、交流をもっとスムーズに。
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 720 }}
            >
              コミュニティの発見、相互理解、コラボを後押しする内定者向けポータル。
              プロフィールの作成からコミュニティ参加まで、ここから始めましょう。
            </Typography>

            {/* CTAボタン（内定者を探す/コミュニティを見る/自分のプロフィール）は一旦非表示にしました */}
          </Stack>
        </Container>
      </Box>

      {/* お知らせ（DB連携なしのシンプル表示） */}
      <Container maxWidth="lg" disableGutters sx={{ px: { xs: 0, sm: 3 }, mb: 2 }}>
        <Alert severity="info" variant="outlined" sx={{ borderRadius: 2, whiteSpace: 'pre-wrap' }}>
          {process.env.NEXT_PUBLIC_NOTICE_MESSAGE ?? "現在お知らせはありません"}
        </Alert>
      </Container>

      {/* コンテンツ：BoxのCSS Gridでレイアウト */}
      <Container maxWidth="lg" disableGutters sx={{ pb: { xs: 6, md: 8 }, px: { xs: 0, sm: 3 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            columnGap: { xs: 0, md: 3 },
            rowGap: { xs: 2, md: 3 },
          }}
        >
          <Box>
            <Card sx={{ height: "100%" }}>
              <CardActionArea component={Link} href="/members" aria-label="内定者一覧ページへ移動">
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={1.5}>
                    <GroupsIcon fontSize="large" color="primary" />
                    <Typography variant="h6" fontWeight={800}>内定者一覧</Typography>
                    <Typography variant="body2" color="text.secondary">
                      学部・興味・スキルで検索。つながりを見つけよう。
                    </Typography>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>
          <Box>
            <Card sx={{ height: "100%" }}>
              <CardActionArea component={Link} href="/communities" aria-label="コミュニティページへ移動">
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={1.5}>
                    <ForumIcon fontSize="large" color="primary" />
                    <Typography variant="h6" fontWeight={800}>コミュニティ</Typography>
                    <Typography variant="body2" color="text.secondary">
                      サークル・PJ・勉強会など、興味ある場に参加しよう。
                    </Typography>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>

          {/* あなたのプロフィール（2段目・1行で配置） */}
          <Box sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">あなたのプロフィール</Typography>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.5 }}>
                  <Avatar src={avatarUrl} alt={me.name ?? "プロフィール"} sx={{ width: 40, height: 40 }} />
                  <Typography variant="h6" fontWeight={800}>{me.name ?? "未設定"}</Typography>
                </Stack>
                <Divider sx={{ my: 1.5 }} />
                <Stack spacing={0.5}>
                  <Typography variant="body2"><strong>ID:</strong> {me.id}</Typography>
                  {me?.handleName && (
                    <Typography variant="body2"><strong>ハンドルネーム:</strong> {me.handleName}</Typography>
                  )}
                  <Typography variant="body2"><strong>出身:</strong> {me?.origin || "未設定"}</Typography>
                  {me?.university && (
                    <Typography variant="body2"><strong>大学:</strong> {me.university}</Typography>
                  )}
                </Stack>
                {hobbyNames.length > 0 && (
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                    {hobbyNames.map((name) => (
                      <Chip key={name} label={name} size="small" />
                    ))}
                  </Stack>
                )}
                <Stack direction="row" spacing={1.5} sx={{ mt: 2 }} useFlexGap flexWrap="wrap">
                  <Button component={Link} href="/myPage" size="small" variant="outlined" startIcon={<PersonIcon />}>プロフィールを編集</Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </main>
  );
}
