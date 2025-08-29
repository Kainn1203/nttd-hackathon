// components/mypage/ProfileForm.tsx
"use client";

import { useMemo, useState, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  Autocomplete,
  Avatar,
} from "@mui/material";

type Me = {
  id: number;
  name?: string | null;
  handleName?: string | null;
  imagePath?: string;
  origin?: string | null;
  pr?: string | null;
  lastName?: string | null;
  firstName?: string | null;
  lastNameKana?: string | null;
  firstNameKana?: string | null;
  university?: string | null;
};

type HobbyOption = { id: number; hobby: string };

export default function ProfileForm({
  me,
  hobbyOptions,
  userHobby,
  onSubmit,
}: {
  me: Me;
  hobbyOptions: HobbyOption[];
  userHobby: { hobby_id: number }[];
  onSubmit: (data: {
    lastName: string;
    firstName: string;
    lastNameKana: string;
    firstNameKana: string;
    handleName: string;
    origin: string;
    pr: string;
    university: string;
    hobby: string[];
    avatarFile?: File | null;
  }) => void;
}) {
  const [origin, setOrigin] = useState<string>(me.origin ?? "");
  const [formData, setFormData] = useState({
    lastName: me.lastName ?? "",
    firstName: me.firstName ?? "",
    lastNameKana: me.lastNameKana ?? "",
    firstNameKana: me.firstNameKana ?? "",
    handleName: me.handleName ?? "",
    pr: me.pr ?? "",
    university: me.university ?? "",
  });

  // hobby名前一覧
  const optionNames = useMemo(
    () => hobbyOptions.map((h) => h.hobby),
    [hobbyOptions]
  );

  // userHobby → hobby_id → hobby 名に変換 (初期値表示用)
  const initialSelectedHobbies = useMemo(
    () =>
      userHobby
        .map((uh) => hobbyOptions.find((h) => h.id === uh.hobby_id)?.hobby)
        .filter((hobby): hobby is string => Boolean(hobby)),
    [userHobby, hobbyOptions]
  );

  const [selectedHobbyNames, setSelectedHobbyNames] = useState<string[]>(
    initialSelectedHobbies
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // hobby 名 → hobby_id に変換
    const selectedHobbyIds = selectedHobbyNames
      .map((name) => hobbyOptions.find((h) => h.hobby === name)?.id)
      .filter((id): id is number => typeof id === "number");

    onSubmit({
      ...formData,
      origin,
      hobby: selectedHobbyNames,
      avatarFile: avatarFile,
    });
  };

  // 画像アップロード
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    me.imagePath ?? null
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ p: 4, maxWidth: 900, mx: "auto" }}
    >
      {/* 左：写真 / 右：入力 */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "220px 1fr" },
          gap: 10,
          alignItems: "start",
          // gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
        }}
      >
        {/* ユーザー写真 */}
        <Box sx={{ textAlign: "center" }}>
          <Avatar
            src={avatarPreview ?? undefined}
            sx={{ width: 220, height: 220, mx: "auto", cursor: "pointer" }}
            onClick={handleAvatarClick}
          />
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleAvatarChange}
          />
        </Box>

        <Box>
          {/* 名前 */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              label="漢字姓"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="漢字名"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="カナ姓"
              name="lastNameKana"
              value={formData.lastNameKana}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="カナ名"
              name="firstNameKana"
              value={formData.firstNameKana}
              onChange={handleChange}
              fullWidth
            />
          </Box>

          {/* ハンドルネーム */}
          <Box mt={2}>
            <TextField
              label="ハンドルネーム"
              name="handleName"
              value={formData.handleName}
              onChange={handleChange}
              fullWidth
            />
          </Box>

          {/* 大学名 */}
          <Box mt={2}>
            <TextField
              label="大学名"
              name="university"
              value={formData.university}
              onChange={handleChange}
              fullWidth
              placeholder="例：○○大学"
            />
          </Box>

          {/* 出身地 */}
          <Box mt={2}>
            <Select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              displayEmpty
              fullWidth
            >
              <MenuItem value="">
                <em>出身地を選択してください</em>
              </MenuItem>
              {[
                "北海道",
                "青森",
                "岩手",
                "宮城",
                "秋田",
                "山形",
                "福島",
                "茨城",
                "栃木",
                "群馬",
                "埼玉",
                "千葉",
                "東京",
                "神奈川",
                "新潟",
                "富山",
                "石川",
                "福井",
                "山梨",
                "長野",
                "岐阜",
                "静岡",
                "愛知",
                "三重",
                "滋賀",
                "京都",
                "大阪",
                "兵庫",
                "奈良",
                "和歌山",
                "鳥取",
                "島根",
                "岡山",
                "広島",
                "山口",
                "徳島",
                "香川",
                "愛媛",
                "高知",
                "福岡",
                "佐賀",
                "長崎",
                "熊本",
                "大分",
                "宮崎",
                "鹿児島",
                "沖縄",
                "海外",
              ].map((pref) => (
                <MenuItem key={pref} value={pref}>
                  {pref}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* 自己紹介 */}
          <Box mt={2}>
            <TextField
              label="自己紹介（PR）"
              name="pr"
              value={formData.pr}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={2}
            />
          </Box>

          {/* 趣味 */}
          <Box mt={2}>
            <Autocomplete
              multiple
              freeSolo
              options={optionNames}
              value={selectedHobbyNames}
              onChange={(_, newValue) => setSelectedHobbyNames(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="趣味（複数選択・新規追加可）"
                  placeholder="入力→Enterで追加"
                  helperText="既存はクリック、新規は入力してEnter"
                />
              )}
            />
          </Box>
        </Box>
      </Box>

      <Box mt={4} display="flex" justifyContent="flex-end">
        <Button type="submit" variant="contained">
          保存
        </Button>
      </Box>
    </Box>
  );
}
