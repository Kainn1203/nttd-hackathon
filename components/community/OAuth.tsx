"use client";
import { usePathname, useSearchParams } from "next/navigation";

export default function OAuth() {
  const pathname = usePathname();
  const search = useSearchParams();
  const current = pathname + (search?.toString() ? `?${search}` : "");
  const href = `/api/slack/oauth/start?return_to=${encodeURIComponent(
    current
  )}`;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Slack 連携テスト</h1>
      <a href={href} className="inline-block border px-4 py-2 rounded">
        Slackでログイン（OAuth開始）
      </a>
      <p className="text-sm opacity-70">
        許可後に「OAuth OK」と表示されたら、このページへ戻ってきてください。
      </p>
    </main>
  );
}
