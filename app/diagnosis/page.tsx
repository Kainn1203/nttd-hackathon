// app/diagnosis/page.tsx (Server Component)
import React from 'react'
import { redirect } from 'next/navigation'
import { getMe } from '@/lib/supabase/me'
import DiagnosisClientWrapper from './DiagnosisClientWrapper'

export default async function DiagnosisPage() {
  // サーバーサイドでユーザー情報を取得
  const me = await getMe()
  
  // 未ログインの場合はログインページにリダイレクト
  if (!me) {
    redirect('/auth/login')
  }

  // クライアントコンポーネントにユーザー情報を渡す
  return (
    <DiagnosisClientWrapper
      userId={me.id}
      userName={me.name || 'ユーザー'}
    />
  )
}