export type Me = {
  id: number; // 内定者ID
  authId: string; // SupabaseのUUID（内部処理用）
  email: string; // メールアドレス
  name: string; // 名前（フルネーム）
  handleName?: string; // ハンドルネーム
  imagePath?: string; // 写真のパス
  origin?: string; // 出身地
  pr?: string; // 自己PR
} | null;
