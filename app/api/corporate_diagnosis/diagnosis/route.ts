// app/api/corporate_diagnosis/diagnosis/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Body = { userId: number; answers: (1 | 2 | 3)[] };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 1=100, 2=50, 3=0
const choiceScore = (c: 1 | 2 | 3) => (c === 1 ? 100 : c === 2 ? 50 : 0);

// 閾値 → type_key (20点刻み)
// type1: 0-20点
// type2: 21-40点
// type3: 41-60点
// type4: 61-80点
// type5: 81-100点
const decideTypeKey = (p: number) =>
  p <= 20
    ? "type1"
    : p <= 40
    ? "type2"
    : p <= 60
    ? "type3"
    : p <= 80
    ? "type4"
    : "type5";

// ★ 追加：タイプ名
const typeNames: Record<string, string> = {
  type1: "ゆるふわ KAIWAI",
  type2: "今日、定時に恋しました。",
  type3: "タイパ重視",
  type4: "残業するのは、ダメですか？",
  type5: "残業が尊い….！",
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Body;

  // バリデーション
  if (typeof body?.userId !== "number")
    return new Response(
      JSON.stringify({ error: "userId (number) is required" }),
      { status: 400 }
    );
  if (!Array.isArray(body.answers) || body.answers.length !== 10)
    return new Response(
      JSON.stringify({ error: "answers must be length 10" }),
      { status: 400 }
    );
  if (!body.answers.every((v) => v === 1 || v === 2 || v === 3))
    return new Response(
      JSON.stringify({ error: "each answer must be 1|2|3" }),
      { status: 400 }
    );

  // 採点
  const total = body.answers.reduce((s, c) => s + choiceScore(c), 0);
  const percent = Math.round(total / body.answers.length); // 0-100
  const typeKey = decideTypeKey(percent);

  // 保存
  const { data, error } = await supabase
    .from("corporate_slave_diagnosis")
    .insert({
      user_id: body.userId,
      scores: percent,
      diagnosis_result: typeNames[typeKey],
    })
    .select()
    .single();
  if (error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });

  // 返却（★ name を含める）
  return new Response(
    JSON.stringify({
      id: data.id,
      userId: body.userId,
      scores: percent,
      type: { key: typeKey, name: typeNames[typeKey] },
      createdAt: data.created_at,
    }),
    { status: 200 }
  );
}
