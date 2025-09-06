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
import {
  Menu as MenuIcon,
  Groups as GroupsIcon,
  Forum as ForumIcon,
  Psychology as PsychologyIcon,
  Event as EventIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

const nav = [
  { href: "/members", label: "内定者一覧", icon: <GroupsIcon /> },
  { href: "/communities", label: "コミュニティ", icon: <ForumIcon /> },
  { href: "/events", label: "イベント", icon: <EventIcon /> },
  { href: "/diagnosis", label: "社畜度診断", icon: <PsychologyIcon /> },
  { href: "/myPage", label: "マイページ", icon: <PersonIcon /> },
];

export default function Header() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname() ?? "/";

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
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: { xs: "60%", md: "none" },
            }}
            noWrap
          >
            NTTデータ内定者向けコミュニティ
          </Typography>

          {/* 余白が狭い時はボタンをハンバーガーに収納（lg以上で表示） */}
          <Box sx={{ display: { xs: "none", lg: "flex" }, flexGrow: 1 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 1,
                width: "100%",
                alignItems: "stretch",
              }}
            >
              {nav.map((n) => {
                const isActive =
                  pathname === n.href || pathname.startsWith(`${n.href}/`);
                return (
                  <Button
                    key={n.href}
                    component={Link}
                    href={n.href}
                    startIcon={
                      <Box
                        className="nav-icon"
                        sx={{
                          display: "inline-flex",
                          transition: "transform .2s ease",
                          transformOrigin: "center",
                        }}
                      >
                        {n.icon}
                      </Box>
                    }
                    size="small"
                    color="primary"
                    fullWidth
                    sx={{
                      width: "100%",
                      height: "100%",
                      justifyContent: "center",
                      fontWeight: 700,
                      borderRadius: 1,
                      whiteSpace: "nowrap",
                      px: 2,
                      backgroundColor: isActive
                        ? "action.selected"
                        : "transparent",
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                      "&:hover .nav-icon": { transform: "scale(1.12)" },
                    }}
                  >
                    {n.label}
                  </Button>
                );
              })}
            </Box>
          </Box>

          {/* モバイル：ハンバーガー */}
          <IconButton
            sx={{ display: { xs: "inline-flex", lg: "none" } }}
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
        <Box
          role="presentation"
          sx={{ width: 260 }}
          onClick={() => setOpen(false)}
        >
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
