// app/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMe } from "@/lib/supabase/me";

import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import ForumIcon from "@mui/icons-material/Forum";

export default async function Home() {
  const me = await getMe();
  if (!me) redirect("/login");

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
              sx={{ fontWeight: 800, lineHeight: 1.15, fontSize: { xs: 28, sm: 36, md: 44 } }}
            >
              {me.name ?? "内定者"}さん、交流をもっとスムーズに。
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
              コミュニティの発見、相互理解、コラボを後押しする内定者向けポータル。
              プロフィールの作成からコミュニティ参加まで、ここから始めましょう。
            </Typography>

            {/* CTAボタン（内定者を探す/コミュニティを見る/自分のプロフィール）は一旦非表示にしました */}
          </Stack>
        </Container>
      </Box>

      {/* コンテンツ：カードを1行3枚で揃える（空白を減らす） */}
      <Container maxWidth="lg" disableGutters sx={{ pb: { xs: 6, md: 8 }, px: { xs: 0, sm: 3 } }}>
        <Grid container rowSpacing={{ xs: 2, md: 3 }} columnSpacing={{ xs: 0, md: 3 }}>
          <Grid xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <CardActionArea component={Link} href="/ICHIRAN" aria-label="内定者一覧ページへ移動">
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
          </Grid>
          <Grid xs={12} md={6}>
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
          </Grid>

          {/* あなたのプロフィール（2段目・1行で配置） */}
          <Grid xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">あなたのプロフィール</Typography>
                <Typography variant="h6" fontWeight={800} sx={{ mt: 0.5 }}>
                  {me.name ?? "未設定"}
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Stack spacing={0.5}>
                  <Typography variant="body2"><strong>ID:</strong> {me.id}</Typography>
                  {me?.handleName && (
                    <Typography variant="body2"><strong>ハンドルネーム:</strong> {me.handleName}</Typography>
                  )}
                  {me?.origin && (
                    <Typography variant="body2"><strong>出身:</strong> {me.origin}</Typography>
                  )}
                </Stack>
                <Stack direction="row" spacing={1.5} sx={{ mt: 2 }} useFlexGap flexWrap="wrap">
                  <Button
                    component={Link}
                    href="/profile"
                    size="small"
                    variant="outlined"
                    startIcon={<PersonIcon />}
                  >
                    プロフィールを編集
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </main>
  );
}
