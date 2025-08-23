"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Msg = { ts: string; text?: string; user?: string; subtype?: string };
type Profiles = Record<string, { name: string; image: string }>;

const CHANNEL_ID = process.env.NEXT_PUBLIC_SLACK_CHANNEL_ID as string;
const SUBDOMAIN = process.env.NEXT_PUBLIC_SLACK_WORKSPACE_SUBDOMAIN;
const TEAM_ID = process.env.NEXT_PUBLIC_SLACK_TEAM_ID;

const webUrl = TEAM_ID
  ? `https://app.slack.com/client/${TEAM_ID}/${CHANNEL_ID}`
  : SUBDOMAIN
  ? `https://${SUBDOMAIN}.slack.com/archives/${CHANNEL_ID}`
  : undefined;

function renderText(text = "", profiles: Profiles) {
  return text.replace(
    /<@([A-Z0-9]+)>/g,
    (_, id) => `@${profiles[id]?.name ?? id}`
  );
}

const timeFmt = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
});
const dateFmt = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
function formatSlackTs(ts: string) {
  const d = new Date(Math.round(parseFloat(ts) * 1000));
  return {
    date: dateFmt.format(d),
    time: timeFmt.format(d),
    full: d.toISOString(),
  };
}

export default function SlackChat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [profiles, setProfiles] = useState<Profiles>({});
  const [me, setMe] = useState<string | undefined>();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load(cursor?: string) {
    const url = `/api/slack/history?channel=${CHANNEL_ID}${
      cursor ? `&cursor=${cursor}` : ""
    }`;
    const r = await fetch(url, { cache: "no-store" });
    const j = await r.json();
    // ★ ここを追加：ts の昇順（古い→新しい）に並べ替える
    const sorted = (j.messages ?? [])
      .slice()
      .sort((a: Msg, b: Msg) => parseFloat(a.ts) - parseFloat(b.ts));
    setMsgs(sorted);
    setProfiles(j.users ?? {});
    setMe(j.me);
    requestAnimationFrame(() =>
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    );
  }

  async function send() {
    if (!text.trim()) return;
    const r = await fetch("/api/slack/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: CHANNEL_ID, text }),
    });
    setText("");
    await load();
    if (!r.ok) alert("送信に失敗しました");
  }

  async function join() {
    const r = await fetch("/api/slack/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: CHANNEL_ID }),
    });
    const j = await r.json();
    if (j.ok) {
      await load();
      if (webUrl) window.open(webUrl, "_blank");
    } else {
      alert("参加に失敗しました: " + JSON.stringify(j));
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="p-6 space-y-3 max-w-2xl">
      <h1 className="text-lg font-bold">Slack チャット</h1>

      <div className="flex gap-2">
        <button onClick={() => load()} className="border rounded px-3 py-1">
          再読込
        </button>
        <button onClick={join} className="border rounded px-3 py-1">
          チャンネルに参加（公開CH）
        </button>
        {webUrl && (
          <button
            onClick={() => window.open(webUrl, "_blank")}
            className="border rounded px-3 py-1"
          >
            Slackで開く（ブラウザ）
          </button>
        )}
      </div>

      <div className="border rounded p-3 h-[70vh] overflow-auto bg-white">
        {msgs.map((m) => {
          const uid = m.user ?? "";
          const p = profiles[uid];
          const isMe = uid === me; // ← boolean に
          const isSystem = !!m.subtype && m.subtype !== "thread_broadcast";
          const sent = formatSlackTs(m.ts);

          return (
            <div key={m.ts} className="mb-3">
              {/* 行：吹き出し */}
              <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                {!isMe && !isSystem && (
                  <Image
                    src={p?.image || "/favicon.ico"}
                    alt=""
                    width={32}
                    height={32}
                    sizes="32px"
                    className="w-8 h-8 rounded-full mr-2 self-end"
                  />
                )}
                <div
                  className={`max-w-[70%] rounded-2xl px-3 py-2 whitespace-pre-wrap break-words
                    ${
                      isSystem
                        ? "bg-gray-50 text-gray-500 italic"
                        : isMe
                        ? "bg-blue-500 text-white rounded-tr-none"
                        : "bg-gray-100 text-gray-900 rounded-tl-none"
                    }`}
                >
                  {!isMe && !isSystem && (
                    <div className="text-xs opacity-70 mb-1">
                      {p?.name ?? uid}
                    </div>
                  )}
                  <div>{renderText(m.text ?? "", profiles)}</div>
                </div>
                {isMe && !isSystem && (
                  <Image
                    src={profiles[uid]?.image || "/favicon.ico"}
                    alt=""
                    width={32}
                    height={32}
                    sizes="32px"
                    className="w-8 h-8 rounded-full ml-2 self-end"
                  />
                )}
              </div>

              {/* 時刻（吹き出しの下） */}
              <div
                className={`mt-1 text-[10px] opacity-60 ${
                  isMe ? "text-right" : "text-left"
                }`}
                title={sent.full}
              >
                {sent.date} {sent.time}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="border rounded px-3 py-2 flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="メッセージを入力（Enterで送信 / Shift+Enterで改行）"
          onKeyDown={(e) =>
            e.key === "Enter" &&
            (e.shiftKey ? null : (e.preventDefault(), send()))
          }
        />
        <button onClick={send} className="border rounded px-4 py-2">
          送信
        </button>
      </div>
    </main>
  );
}
