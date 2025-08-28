// app/communities/page.tsx
import CommunitiesMain from './main';
import { getMe } from '@/lib/supabase/me';
import { redirect } from 'next/navigation';

export default async function CommunitiesPage() {
  const me = await getMe();
  if (!me) redirect('/login');       // 未ログインはサーバーで弾く

  return <CommunitiesMain meId={me.id} />;  // ← me.id をクライアントへ渡す
}
