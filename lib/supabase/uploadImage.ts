// lib/supabase/uploadImage.ts
import { createClient } from "@/utils/supabase/client";

export async function uploadImage(
  file: File,
  options: {
    bucket: string;
    folder?: string;
  }
): Promise<string> {
  const supabase = createClient();

  // ファイル名を安全な形式に変換（日本語文字を除去）
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2);
  const fileExtension = file.name.split('.').pop() || 'jpg';
  
  // 日本語や特殊文字を除去した安全なファイル名
  const safeFileName = `${timestamp}_${randomId}.${fileExtension}`;
  const filePath = options.folder ? `${options.folder}/${safeFileName}` : safeFileName;

  console.log("📁 アップロードパス:", filePath);
  console.log("📦 バケット:", options.bucket);

  try {
    // 1. ファイルをStorageにアップロード
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(options.bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false // 同名ファイルの上書きを防ぐ
      });

    if (uploadError) {
      console.error("❌ アップロードエラー:", uploadError);
      throw new Error(`画像のアップロードに失敗しました: ${uploadError.message}`);
    }

    console.log("✅ アップロード成功:", uploadData);

    // 2. パブリックURLを取得
    const { data: urlData } = supabase.storage
      .from(options.bucket)
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error("パブリックURLの取得に失敗しました");
    }

    console.log("🔗 生成されたURL:", urlData.publicUrl);
    return urlData.publicUrl;

  } catch (error) {
    console.error("❌ uploadImage エラー:", error);
    throw error;
  }
}