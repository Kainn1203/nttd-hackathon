// lib/supabase/image.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! // ← 署名付きキーではなく publishable key
);

// ==============================
// 型定義
// ==============================
export interface UploadOptions {
  bucket: string;        // 必須: バケット名
  folder?: string;       // 任意: フォルダ名
  table?: string;        // 将来拡張用
  column?: string;       // 将来拡張用
}

// ==============================
// 1. アップロード処理
// ==============================
export const uploadImage = async (
  file: File,
  options: UploadOptions
): Promise<string | null> => {
  console.log("=== uploadImage 開始 ===");
  console.log("ファイル:", file);
  console.log("オプション:", options);

  if (!file) {
    console.log("❌ ファイルが存在しません");
    return null;
  }

  // ユニークなファイル名を生成
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const fileName = `${timestamp}_${randomSuffix}_${file.name}`;

  const filePath = options.folder ? `${options.folder}/${fileName}` : fileName;
  console.log("生成されたファイルパス:", filePath);

  try {
    // Storageにアップロード
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(options.bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false, // 同名ファイルの上書きを防ぐ
      });

    if (uploadError) {
      console.error("❌ Storage upload error:", uploadError);
      return null;
    }

    console.log("✅ アップロード成功:", uploadData);

    // 公開URLを返す
    return getPublicImageUrl(options.bucket, filePath);
  } catch (error) {
    console.error("❌ uploadImage エラー:", error);
    return null;
  }
};

// ==============================
// 2. 公開URL生成処理
// ==============================
export function getPublicImageUrl(bucket: string, path?: string | null): string | null {
  if (!path) return null;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL が未設定です");
    return null;
  }

  const cleanPath = path.replace(/^\/+/, ""); // 先頭のスラッシュを削除

  return `${base}/storage/v1/object/public/${bucket}/${cleanPath}`;
}
