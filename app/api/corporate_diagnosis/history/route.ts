// app/api/corporate_diagnosis/history/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'userId is required' }),
      { status: 400 }
    );
  }

  // 最新1件を取得
  const { data, error } = await supabase
    .from('corporate_slave_diagnosis')
    .select('*')
    .eq('user_id', Number(userId))
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle(); // ← 0件なら null を返す

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // レコードが無い場合
  if (!data) {
    return new Response(
      JSON.stringify({ message: '診断なし' }),
      { status: 200 }
    );
  }

  // レコードがある場合 → そのまま返す
  return new Response(JSON.stringify(data), { status: 200 });
}