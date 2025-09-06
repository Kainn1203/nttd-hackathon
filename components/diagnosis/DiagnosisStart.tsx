'use client'


import React, { useState, useEffect } from 'react'


// ===== タイプ判定用ユーティリティ =====
type TypeKey = 'type1' | 'type2' | 'type3' | 'type4' | 'type5'


const TYPE_IMAGE_MAP: Record<TypeKey, string> = {
  type1: '/images/score_v1_transparent.png',
  type2: '/images/score_v2_transparent.png',
  type3: '/images/score_v3_transparent.png',
  type4: '/images/score_v4_transparent.png',
  type5: '/images/score_v5_transparent.png',
}


const TYPE_DISPLAY_NAME: Record<TypeKey, string> = {
  type1: 'ゆるふわ KAIWAI',
  type2: '今日、定時に恋しました。',
  type3: 'タイパ重視',
  type4: '残業するのは、ダメですか？',
  type5: '残業が尊い...！',
}


// 名称の表記ゆれを吸収（句読点の「、／，」「。／．」も考慮）
const TYPE_NAME_TO_KEY: Record<string, TypeKey> = {
  'ゆるふわ KAIWAI': 'type1',
  '今日、定時に恋しました。': 'type2',
  '今日，定時に恋しました．': 'type2',
  'タイパ重視': 'type3',
  '残業するのは、ダメですか？': 'type4',
  '残業するのは，ダメですか？': 'type4',
  '残業が尊い...！': 'type5',
  '残業が尊い．．．！': 'type5',
}


const TYPE_ID_TO_KEY: Record<number, TypeKey> = {
  1: 'type1',
  2: 'type2',
  3: 'type3',
  4: 'type4',
  5: 'type5',
}


// ===== 型（DB由来のゆるい形を許容） =====
interface DiagnosisType {
  key?: TypeKey | string
  name?: string
  id?: number
}


interface PreviousResultRaw {
  diagnosis_result?: string
  scores: number
  created_at: string
  type?: DiagnosisType
  type_id?: number
  typeId?: number
}


interface DiagnosisStartProps {
  userId: number
  userName: string
  onStart: (userName: string) => void
}


// ===== タイプキー解決 =====
function resolveTypeKey(prev: PreviousResultRaw | null): TypeKey {
  if (!prev) return 'type3'


  // 1) type.key があれば最優先
  const k = prev.type?.key
  if (k && ['type1','type2','type3','type4','type5'].includes(k as string)) {
    return k as TypeKey
  }


  // 2) 数値ID（type_id / typeId / type.id）
  const id = prev.type_id ?? prev.typeId ?? prev.type?.id
  if (typeof id === 'number' && TYPE_ID_TO_KEY[id]) {
    return TYPE_ID_TO_KEY[id]
  }


  // 3) 日本語名（diagnosis_result / type.name）
  const name = (prev.diagnosis_result ?? prev.type?.name)?.trim()
  if (name) {
    if (TYPE_NAME_TO_KEY[name]) return TYPE_NAME_TO_KEY[name]


    // ゆる一致
    if (name.includes('ゆる') || name.includes('KAIWAI')) return 'type1'
    if (name.includes('定時')) return 'type2'
    if (name.includes('タイパ')) return 'type3'
    if (name.includes('残業するのは')) return 'type4'
    if (name.includes('尊い')) return 'type5'
  }


  // 4) デフォルト
  return 'type3'
}


export default function DiagnosisStart({ userId, userName, onStart }: DiagnosisStartProps) {
  const [previousResult, setPreviousResult] = useState<PreviousResultRaw | null>(null)
  const [loading, setLoading] = useState(true)


  // 過去の診断結果を取得
  useEffect(() => {
    const fetchPreviousResult = async () => {
      try {
        const response = await fetch(`/api/corporate_diagnosis/history?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          if (!data.message) setPreviousResult(data as PreviousResultRaw)
        }
      } catch (error) {
        console.error('過去の診断結果の取得に失敗:', error)
      } finally {
        setLoading(false)
      }
    }


    if (userId) fetchPreviousResult()
    else setLoading(false)
  }, [userId])


  const handleStart = () => onStart(userName || 'ゲスト')


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-300 via-sky-200 to-purple-300 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-1/2 -right-1/4 w-full h-full bg-gradient-to-br from-cyan-200/60 to-sky-300/40 rounded-full transform scale-150 blur-3xl"></div>
          <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-gradient-to-br from-white/20 to-cyan-200/30 transform rotate-45 blur-xl"></div>
          <div className="absolute -bottom-1/3 -left-1/4 w-0 h-0 border-l-[200px] border-r-[200px] border-b-[300px] border-l-transparent border-r-transparent border-b-purple-200/40 transform rotate-12 blur-2xl"></div>
        </div>
        <div className="bg-slate-900/80 backdrop-blur-3xl rounded-2xl shadow-xl p-6 text-center border border-slate-700/50 relative z-10">{/* 旧: rounded-3xl p-8 border-2 shadow-2xl */}
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan-400 border-t-transparent mx-auto mb-3"></div>{/* 旧: h-12 w-12 */}
          <p className="text-cyan-100 font-medium text-sm">データを読み込み中．．．</p>{/* 旧: デフォルトサイズ */}
        </div>
      </div>
    )
  }


  // 画像と表示名
  const tkey = resolveTypeKey(previousResult)
  const iconSrc = TYPE_IMAGE_MAP[tkey]
  const typeName = TYPE_DISPLAY_NAME[tkey]


  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-300 via-sky-200 to-purple-300 relative overflow-hidden">
      {/* 背景装飾は元コードのまま */}
{/* 背景（薄くする） */}
<div className="absolute inset-0 z-0 pointer-events-none opacity-60">
  {/* 大きな丸いグラデーション */}
  <div className="absolute -top-1/3 -right-1/4 w-full h-4/5 bg-gradient-to-br from-cyan-200/50 to-sky-300/30 rounded-full scale-200 blur-2xl"></div>
  <div className="absolute top-1/4 -left-1/3 w-3/4 h-3/4 bg-gradient-to-tr from-sky-100/40 to-cyan-200/25 rounded-full scale-150 blur-2xl"></div>
  <div className="absolute -bottom-1/4 right-1/4 w-2/3 h-2/3 bg-gradient-to-tl from-purple-200/45 to-pink-200/30 rounded-full scale-110 blur-xl"></div>


  {/* 線装飾 */}
  <div className="absolute top-10 left-10 w-60 h-0.5 bg-white/50 rotate-[20deg]"></div>
  <div className="absolute top-20 left-20 w-100 h-0.5 bg-white/50 rotate-45"></div>
  <div className="absolute top-40 right-20 w-72 h-0.5 bg-white/50 -rotate-[15deg]"></div>
  <div className="absolute top-60 right-40 w-60 h-0.5 bg-white/50 -rotate-12"></div>
  <div className="absolute bottom-60 left-1/3 w-40 h-0.5 bg-white/50 rotate-30"></div>
  <div className="absolute bottom-40 right-1/4 w-80 h-0.5 bg-white/50 rotate-[12deg]"></div>
  <div className="absolute top-1/2 left-1/5 w-48 h-0.5 bg-white/50 rotate-[75deg]"></div>
  <div className="absolute bottom-1/4 left-1/6 w-56 h-0.5 bg-white/50 -rotate-[25deg]"></div>
  <div className="absolute top-1/3 right-1/5 w-64 h-0.5 bg-white/50 rotate-[5deg]"></div>
  <div className="absolute bottom-10 left-1/2 w-72 h-0.5 bg-white/50 rotate-[40deg]"></div>


  {/* 三角／多角形・小物 */}
  <div className="absolute top-20 left-20 w-0 h-0 border-l-[150px] border-r-[150px] border-b-[225px] border-l-transparent border-r-transparent border-b-cyan-300/25 rotate-45 blur-md"></div>
  <div className="absolute top-20 left-20 w-0 h-0 border-l-[500px] border-r-[500px] border-b-[750px] border-l-transparent border-r-transparent border-b-cyan-300/70 rotate-45 blur-[1px]"></div>
  <div className="absolute bottom-40 right-40 w-0 h-0 border-l-[400px] border-r-[400px] border-b-[600px] border-l-transparent border-r-transparent border-b-purple-300/60 -rotate-30 blur-[1px]"></div>
  <div className="absolute top-1/2 left-1/4 w-0 h-0 border-l-[300px] border-r-[300px] border-b-[450px] border-l-transparent border-r-transparent border-b-white/40 rotate-60 blur-[1px]"></div>


  <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-gradient-to-br from-sky-200/30 to-cyan-300/20 rotate-12 blur-lg"></div>
  <div className="absolute bottom-1/3 left-1/2 w-24 h-24 bg-gradient-to-tl from-purple-200/25 to-pink-200/20 -rotate-45 blur-md"></div>
  <div className="absolute top-3/4 right-1/6 w-16 h-16 bg-gradient-to-br from-white/25 to-sky-100/20 rotate-30 blur-sm"></div>


  <div className="absolute top-1/3 right-1/3 w-[160px] h-[160px] bg-gradient-to-br from-sky-200/50 to-cyan-300/40 rotate-12"></div>
  <div className="absolute bottom-1/3 left-1/2 w-[120px] h-[120px] bg-gradient-to-tl from-purple-200/50 to-pink-200/40 -rotate-45"></div>
  <div className="absolute top-3/4 right-1/6 w-[80px] h-[80px] bg-gradient-to-br from-white/50 to-sky-100/40 rotate-30"></div>


  {/* コーナーのぼかし円 */}
  <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-cyan-400/15 to-transparent rounded-full shadow-inner"></div>
  <div className="absolute bottom-0 left-0 w-2/5 h-2/5 bg-gradient-to-tr from-purple-300/20 to-transparent rounded-full shadow-inner"></div>
</div>


{/* さらに薄くする白ベール（必要なら残す） */}
<div className="absolute inset-0 z-0 pointer-events-none bg-white/10"></div>
      {/* ヘッダー */}
<header className="relative z-10 pt-16 pb-10">
  <div className="max-w-3xl mx-auto px-4 text-center">
    {/* タイトル */}
    <h1
      className="text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] mb-6"
    >
      社畜度診断テスト
    </h1>
    {/* 説明文 */}
    <p
      className="text-lg md:text-xl font-semibold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)] leading-relaxed"
    >
      {userName}さんの働き方はどのタイプだろうか？<br />
      10個の質問であなたの働き方の特徴を分析しよう
    </p>
  </div>
</header>


      <main className="max-w-3xl mx-auto px-4 pb-12 relative z-10">{/* 旧: max-w-5xl px-6 pb-20 */}
        {/* 過去の診断結果 */}
        {previousResult && (
          <div className="bg-gradient-to-br from-sky-300/60 via-purple-400/50 to-pink-500/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/25 mb-8 hover:shadow-xl transition-all duration-300">{/* 旧: rounded-3xl mb-12 */}
            <div className="px-6 py-6">{/* 旧: px-10 py-8 */}
              <div className="flex items-stretch gap-4">{/* 旧: gap-6 */}
                {/* 左：アイコン（サイズ控えめ） */}
                <div className="flex-shrink-0 flex items-center justify-center">
                  <img
                    src={iconSrc}
                    alt={typeName}
                    className="h-20 w-auto object-contain rounded-lg drop-shadow-[2px_2px_4px_rgba(0,0,0,0.45)]"/>{/* 旧: h-23 rounded-xl 影弱め */}
                </div>


                {/* 右：見出し＋詳細 */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white/90 leading-tight drop-shadow-lg">{/* 旧: text-2xl */}
                    前回の診断結果
                  </h3>


                  <div className="mt-3 grid sm:grid-cols-3 gap-2 text-base">{/* 旧: mt-4 gap-3 text-lg */}
                    <p className="text-white/80 drop-shadow-sm">
                      <span className="font-medium text-white/90">タイプ：</span>
                      {previousResult.diagnosis_result}
                    </p>
                    <p className="text-white/80 drop-shadow-sm">
                      <span className="font-medium text-white/90">スコア：</span>
                      {previousResult.scores}点
                    </p>
                    <p className="text-white/80 drop-shadow-sm">
                      <span className="font-medium text-white/90">診断日：</span>
                      {new Date(previousResult.created_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* テスト概要（タイプ一覧と類似トーン） */}
        <div className="bg-gradient-to-br from-sky-300/60 via-purple-400/50 to-pink-500/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/25 mb-8 hover:shadow-xl transition-all duration-300">{/* 旧: rounded-3xl mb-12 */}
          <div className="px-6 py-8">{/* 旧: px-10 py-12 */}
            <h2 className="text-2xl font-normal text-white/90 mb-8 text-center drop-shadow-lg">{/* 旧: text-3xl mb-12 */}
              診断について
            </h2>


            <div className="grid md:grid-cols-3 gap-6">{/* 旧: gap-10 */}
              {/* 質問数 */}
              <div className="text-center p-4 bg-gradient-to-r from-cyan-200/15 via-cyan-100/10 to-white/5 backdrop-blur-sm rounded-xl border border-cyan-300/30 transition-all duration-300 hover:from-cyan-200/20 hover:via-cyan-100/15 hover:to-white/10">{/* 旧: p-6 rounded-2xl */}
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/55 to-sky-600/50 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/30">{/* 旧: w-24 h-24 mb-5 */}
                  <span className="text-2xl font-light text-white drop-shadow">{/* 旧: text-4xl */}
                    10
                  </span>
                </div>
                <h3 className="font-semibold text-white/90 mb-1 text-lg drop-shadow">質問数</h3>{/* 旧: mb-2 text-xl */}
                <p className="text-white/75 text-sm drop-shadow-sm">{/* 旧: text-lg */}
                  厳選された10問の質問に答えるだけ
                </p>
              </div>


              {/* 所要時間 */}
              <div className="text-center p-4 bg-gradient-to-r from-sky-200/15 via-sky-100/10 to-white/5 backdrop-blur-sm rounded-xl border border-sky-300/30 transition-all duration-300 hover:from-sky-200/20 hover:via-sky-100/15 hover:to-white/10">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-500/55 to-blue-600/50 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/30">
                  <span className="text-2xl font-light text-white drop-shadow">3</span>
                </div>
                <h3 className="font-semibold text-white/90 mb-1 text-lg drop-shadow">所要時間（分）</h3>
                <p className="text-white/75 text-sm drop-shadow-sm">短時間で正確な診断結果を取得</p>
              </div>


              {/* 診断タイプ数 */}
              <div className="text-center p-4 bg-gradient-to-r from-purple-200/15 via-purple-100/10 to-white/5 backdrop-blur-sm rounded-xl border border-purple-300/30 transition-all duration-300 hover:from-purple-200/20 hover:via-purple-100/15 hover:to-white/10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/55 to-violet-600/50 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/30">
                  <span className="text-2xl font-light text-white drop-shadow">5</span>
                </div>
                <h3 className="font-semibold text-white/90 mb-1 text-lg drop-shadow">診断タイプ</h3>
                <p className="text-white/75 text-sm drop-shadow-sm">5つのカテゴリーから分析</p>
              </div>
            </div>
          </div>
        </div>


        {/* パーソナリティタイプ一覧 */}
        <div className="bg-gradient-to-br from-sky-300/60 via-purple-400/50 to-pink-500/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/25 mb-8 hover:shadow-xl transition-all duration-300">{/* 旧: rounded-3xl mb-12 */}
          <div className="px-6 py-8">{/* 旧: px-10 py-12 */}
            <h2 className="text-2xl font-normal text-white/90 mb-8 text-center drop-shadow-lg">{/* 旧: text-3xl mb-12 */}
              診断タイプ一覧
            </h2>


            <div className="space-y-4">{/* 旧: space-y-6 */}
              {/* タイプ1 */}
              <div className="flex items-center p-5 bg-gradient-to-r from-green-200/15 via-green-100/10 to-white/5 backdrop-blur-sm rounded-xl border border-green-300/30 hover:from-green-200/20 hover:via-green-100/15 hover:to-white/10 transition-all duration-300 shadow-md hover:shadow-lg">{/* 旧: p-8 rounded-2xl */}
                <div className="flex-shrink-0">
                  <img
                    src="/images/score_v1_transparent.png"
                    alt="ゆるふわKAIWAI"
                    width={72} height={72}>{/* 旧: 96 */}
                  </img>
                </div>
                <div className="ml-6 flex-1">{/* 旧: ml-8 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white/90 text-xl drop-shadow-lg">{/* 旧: text-2xl */}
                        ゆるふわ KAIWAI
                      </h3>
                      <p className="text-sm font-semibold text-white/70 mt-1.5 drop-shadow-sm">{/* 旧: text-lg mt-2 */}
                        働き方改革の鑑。自分のペースを大切にする理想的な働き方
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white/80 font-medium mb-2">スコア: 0-15点</div>{/* 旧: text-sm mb-3 */}
                      <div className="w-28 bg-white/20 rounded-full h-2.5 border border-white/30">{/* 旧: w-32 h-3 */}
                        <div className="bg-gradient-to-r from-green-300 to-green-400 h-2.5 rounded-full shadow-sm" style={{width: '15%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* タイプ2 */}
              <div className="flex items-center p-5 bg-gradient-to-r from-blue-200/15 via-blue-100/10 to-white/5 backdrop-blur-sm rounded-xl border border-blue-300/30 hover:from-blue-200/20 hover:via-blue-100/15 hover:to-white/10 transition-all duration-300 shadow-md hover:shadow-lg">
                <div className="flex-shrink-0">
                  <img src="/images/score_v2_transparent.png" alt="今日、定時に恋しました。" width={72} height={72} />
                </div>
                <div className="ml-6 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white/90 text-xl drop-shadow-lg">今日、定時に恋しました。</h3>
                      <p className="text-sm font-semibold text-white/70 mt-1.5 drop-shadow-sm">定時退社に恋をした人。バランス感覚が素晴らしい</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white/80 font-medium mb-2">スコア: 16-35点</div>
                      <div className="w-28 bg-white/20 rounded-full h-2.5 border border-white/30">
                        <div className="bg-gradient-to-r from-blue-300 to-blue-400 h-2.5 rounded-full shadow-sm" style={{width: '35%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* タイプ3 */}
              <div className="flex items-center p-5 bg-gradient-to-r from-yellow-200/15 via-yellow-100/10 to-white/5 backdrop-blur-sm rounded-xl border border-yellow-300/30 hover:from-yellow-200/20 hover:via-yellow-100/15 hover:to-white/10 transition-all duration-300 shadow-md hover:shadow-lg">
                <div className="flex-shrink-0">
                  <img src="/images/score_v3_transparent.png" alt="タイパ重視" width={72} height={72} />
                </div>
                <div className="ml-6 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white/90 text-xl drop-shadow-lg">タイパ重視</h3>
                      <p className="text-sm font-semibold text-white/70 mt-1.5 drop-shadow-sm">効率重視で無駄を嫌う。時間の使い方が上手な現代派</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white/80 font-medium mb-2">スコア: 36-55点</div>
                      <div className="w-28 bg-white/20 rounded-full h-2.5 border border-white/30">
                        <div className="bg-gradient-to-r from-yellow-300 to-yellow-400 h-2.5 rounded-full shadow-sm" style={{width: '55%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* タイプ4 */}
              <div className="flex items-center p-5 bg-gradient-to-r from-orange-200/15 via-orange-100/10 to-white/5 backdrop-blur-sm rounded-xl border border-orange-300/30 hover:from-orange-200/20 hover:via-orange-100/15 hover:to-white/10 transition-all duration-300 shadow-md hover:shadow-lg">
                <div className="flex-shrink-0">
                  <img src="/images/score_v4_transparent.png" alt="残業するのは、ダメですか？" width={72} height={72} />
                </div>
                <div className="ml-6 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white/90 text-xl drop-shadow-lg">残業するのは、ダメですか？</h3>
                      <p className="text-sm font-semibold text-white/70 mt-1.5 drop-shadow-sm">責任感が強くて頑張り屋さん。でも無理は禁物です</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white/80 font-medium mb-2">スコア: 56-75点</div>
                      <div className="w-28 bg-white/20 rounded-full h-2.5 border border-white/30">
                        <div className="bg-gradient-to-r from-orange-300 to-orange-400 h-2.5 rounded-full shadow-sm" style={{width: '75%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* タイプ5 */}
              <div className="flex items-center p-5 bg-gradient-to-r from-red-200/15 via-red-100/10 to-white/5 backdrop-blur-sm rounded-xl border border-red-300/30 hover:from-red-200/20 hover:via-red-100/15 hover:to-white/10 transition-all duration-300 shadow-md hover:shadow-lg">
                <div className="flex-shrink-0">
                  <img src="/images/score_v5_transparent.png" alt="残業が尊い...！" width={72} height={72} />
                </div>
                <div className="ml-6 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white/90 text-xl drop-shadow-lg">残業が尊い...！</h3>
                      <p className="text-sm font-semibold text-white/70 mt-1.5 drop-shadow-sm">残業を愛し、仕事に全てを捧げる。健康第一を忘れずに</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white/80 font-medium mb-2">スコア: 76-100点</div>
                      <div className="w-28 bg-white/20 rounded-full h-2.5 border border-white/30">
                        <div className="bg-gradient-to-r from-red-300 to-red-400 h-2.5 rounded-full shadow-sm" style={{width: '100%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


            </div>


            <div className="mt-6 text-center">{/* 旧: mt-8 */}
              <p className="text-sm font-semibold text-white/70 drop-shadow-sm">{/* 旧: text-lg */}
                スコアが高いほど社畜度が高くなります！
              </p>
            </div>
          </div>
        </div>


        {/* 開始ボタン */}
        <div className="text-center">
          <button
            onClick={handleStart}
            className="bg-gradient-to-r from-cyan-500/80 to-purple-600/80 backdrop-blur-2xl hover:from-cyan-400/90 hover:to-purple-500/90 border border-cyan-400/50 text-white font-medium text-lg px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">{/* 旧: border-2 text-2xl px-16 py-6 rounded-2xl shadow-2xl */}
            診断を開始する
          </button>
          <p className="mt-3 text-sm font-semibold text-white/90 mb-8 text-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
            {/* 旧: mt-6 text-lg */}
            診断には約3分かかるよ            
          </p>
        </div>
      </main>
    </div>
  )
}
