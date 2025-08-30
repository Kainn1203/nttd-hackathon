// lib/supabase/uploadImage.ts
 
import { createClient } from "@supabase/supabase-js";
 
// -----------------------------
// Supabase クライアント作成
// -----------------------------
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);
 
// -----------------------------
// 画像アップロード関数
// -----------------------------
export interface UploadOptions {
  bucket: string;
  folder?: string;
  table?: string; // DB保存先テーブル
  column?: string; // DB保存先カラム
}
 
/**
 * 画像をSupabase Storageにアップロードし、必要であればDBに保存する
 * @param file アップロードするFileオブジェクト
 * @param options バケット名・フォルダ名・テーブル名・カラム名
 * @returns 画像の公開URL
 */
export const uploadImage = async (
  file: File,
  options: UploadOptions
): Promise<string | null> => {
  if (!file) return null;
  console.log("file");
 
  // const folder = options.folder ?? "default_folder";
  const filePath = options.folder
    ? `${"default_folder"}/${file.name}`
    : `${file.name}`;
 
  // Storageにアップロード
  const { error: uploadError } = await supabase.storage
    .from(options.bucket)
    .upload(filePath, file);
 
  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    return null;
  }
 
  // 公開URLを取得
  const { data } = supabase.storage.from(options.bucket).getPublicUrl(filePath);
  const imageUrl = data.publicUrl;
 
  // // DBに保存する場合
  // if (options.table && options.column) {
  //   const { error: dbError } = await supabase
  //     .from(options.table)
  //     .insert({ [options.column]: imageUrl });
 
  //   if (dbError) {
  //     console.error("Database insert error:", dbError);
  //     return null;
  //   }
  // }
 
  return imageUrl;
};
 
 