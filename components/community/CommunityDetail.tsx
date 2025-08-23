import type { Community } from "@/types/community";
import Image from "next/image";

type Props = {
  community: Community;
  imageUrl?: string; // サーバ側で生成して渡す
};

export default function CommunityDetail({ community, imageUrl }: Props) {
  const c = community;
  return (
    <main style={{ padding: 24 }}>
      <h1>コミュニティ詳細</h1>

      {imageUrl && (
        <Image
          src={imageUrl}
          alt={c.name}
          width={320}
          height={180}
          style={{ objectFit: "contain" }}
          unoptimized
        />
      )}

      <div style={{ marginTop: 16, lineHeight: 1.8 }}>
        <div>
          <b>ID:</b> {c.id}
        </div>
        <div>
          <b>名前:</b> {c.name}
        </div>
        <div>
          <b>概要:</b> {c.description ?? "-"}
        </div>
        <div>
          <b>作成者ID:</b> {c.owner_id ?? "-"}
        </div>
        <div>
          <b>作成:</b> {c.created_at ?? "-"}
        </div>
        <div>
          <b>画像パス:</b> {c.image_path ?? "-"}
        </div>
      </div>
    </main>
  );
}
