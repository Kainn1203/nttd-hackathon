"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import GroupsIcon from "@mui/icons-material/Groups";
import ForumIcon from "@mui/icons-material/Forum";
import PersonIcon from "@mui/icons-material/Person";

const nav = [
  { href: "/candidates", label: "内定者一覧", icon: <GroupsIcon /> },
  { href: "/communities", label: "コミュニティ", icon: <ForumIcon /> },
  { href: "/myPage", label: "マイページ", icon: <PersonIcon /> },
];

export default function Header() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname() ?? "/";
  const base = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  const ichiranHref = `${base}/ICHIRAN`;

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}` }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 2 }}>
          {/* 左上ロゴ / タイトル */}
          <Typography
            component={Link}
            href="/"
            sx={{
              textDecoration: "none",
              color: "primary.main",
              fontWeight: 800,
              fontSize: { xs: 16, sm: 18 },
              mr: 1.5,
            }}
         >
            NTTデータ内定者向けコミュニティ
          </Typography>

          {/* md以上：3等分で横一列に埋める */}
          <Box sx={{ display: { xs: "none", md: "flex" }, flexGrow: 1 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 1,
                width: "100%",
              }}
            >
              {nav.map((n) => (
                <Button
                  key={n.href}
                  component={Link}
                  href={n.label === "内定者一覧" ? ichiranHref : n.href}
                  startIcon={n.icon}
                  size="small"
                  color="primary"
                  sx={{ width: "100%", justifyContent: "center", fontWeight: 700 }}
                >
                  {n.label}
                </Button>
              ))}
            </Box>
          </Box>

          {/* モバイル：ハンバーガー */}
          <IconButton
            sx={{ display: { xs: "inline-flex", md: "none" } }}
            onClick={() => setOpen(true)}
            aria-label="メニュー"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      {/* モバイルドロワー */}
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
      >
        <Box role="presentation" sx={{ width: 260 }} onClick={() => setOpen(false)}>
          <List>
            {nav.map((n) => (
              <ListItemButton key={n.href} component={Link} href={n.href}>
                <ListItemIcon>{n.icon}</ListItemIcon>
                <ListItemText primary={n.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
