'use client'

import React, { useState } from 'react'

interface DiagnosisResultsProps {
  userName: string
  result: {
    id: number
    userId: number
    scores: number
    type: {
      key: string
      name: string
    }
    createdAt: string
  }
  onRestart: () => void
}

export default function DiagnosisResults({ userName, result, onRestart }: DiagnosisResultsProps) {
  const [shareText, setShareText] = useState('')
  
  // タイプに応じた表示設定（画像パスを更新）
  const typeConfig = {
    type1: {
      icon: "🌸",
      color: "from-green-300 to-green-400",
      bgGradient: "from-green-200/15 via-green-100/10 to-white/5",
      borderColor: "border-green-300/30",
      imagePath: "/images/result_score_v1_transparent.png", // 画像1: ワークライフバランス重視
      advice: "自分のペース最優先、マイライフイズマイライフ",
      details: {
        characteristic: "仕事よりもプライベートをしっかり優先できるあなたは、残業や同調圧力には染まりにくく、心の平和を守る達人です",
        strengths: "ストレス耐性が高く、燃え尽きにくい。オン・オフの切り替えが明快。自分らしさを大事にしながら働ける。",
        weaknesses: "周囲から「やる気がない？」と誤解されることも。チームプレイより個人プレイを重視しがち。",
        advice: "マイペースを活かしつつ、時にはチームの期待に応える姿勢を見せると信頼度UP。"
      }
    },
    type2: {
      icon: "💕",
      color: "from-blue-300 to-blue-400",
      bgGradient: "from-blue-200/15 via-blue-100/10 to-white/5",
      borderColor: "border-blue-300/30",
      imagePath: "/images/result_score_v2_transparent.png", // 画像2: 残業体質
      advice: "定時ダッシュは正義、メリハリこそ力の源",
      details: {
        characteristic: "仕事はきちんとやるけど、残業は極力しないあなたは、プライベートと仕事をきっちり分けるメリハリ型です✨",
        strengths: "効率を重視して仕事を片付ける。時間意識が高く、スケジュール管理が得意。",
        weaknesses: "柔軟性に欠けると「冷たい人」と思われることも…。突発的な残業対応が苦手。",
        advice: "定時ダッシュを貫くなら「成果で示す」のが鍵！結果を出していれば誰も文句を言えない！"
      }
    },
    type3: {
      icon: "⚡",
      color: "from-yellow-300 to-yellow-400",
      bgGradient: "from-yellow-200/15 via-yellow-100/10 to-white/5",
      borderColor: "border-yellow-300/30",
      imagePath: "/images/result_score_v3_transparent.png", // 画像3: 効率重視
      advice: "効率命！リソースを最大化するスマートワーカー",
      details: {
        characteristic: "時間対効果（タイムパフォーマンス）を最重要視。残業は悪、効率化は善という思想を持っているはず✨",
        strengths: "優先順位付けが得意で、生産性の高いアウトプットを出せる。無駄を嫌うので改善アイデアも豊富。",
        weaknesses: "効率にこだわりすぎて、人間関係のしがらみや「情」に弱い。人によってはドライに見えてしまうことも…。",
        advice: "効率の裏に「人との協調」も少し意識すると、さらに評価が高まる！"
      }
    },
    type4: {
      icon: "😅",
      color: "from-orange-300 to-orange-400",
      bgGradient: "from-orange-200/15 via-orange-100/10 to-white/5",
      borderColor: "border-orange-300/30",
      imagePath: "/images/result_score_v4_transparent.png", // 画像4: バランス型
      advice: "責任感は強い、でも無理はしがちな現実派",
      details: {
        characteristic: "必要があれば残業もいとわない。周囲に合わせて行動できるバランスタイプ。",
        strengths: "協調性と責任感があり、チームからの信頼度が高い。状況に応じて柔軟に動ける。",
        weaknesses: "頑張りすぎて心身を削ることも。周囲の期待に応えようとして、自分を後回しにしがち。",
        advice: "残業は美徳ではなく選択肢のひとつ。無理せず「やるべきこととやらないこと」を整理すると持続可能。"
      }
    },
    type5: {
      icon: "👑",
      color: "from-red-300 to-red-400",
      bgGradient: "from-red-200/15 via-red-100/10 to-white/5",
      borderColor: "border-red-300/30",
      imagePath: "/images/result_score_v5_transparent.png", // 画像5: 仕事中毒
      advice: "働くことが生きがい！自己犠牲すらも厭わぬ使命感タイプ",
      details: {
        characteristic: "残業や休日出勤を「頑張りの証」と捉える。チームのためなら自分を犠牲にすることもいとわない。",
        strengths: "圧倒的な責任感と根性。どんな状況でも踏ん張れる。周囲から「頼れる人」と見られる。",
        weaknesses: "自分を追い込みすぎて燃え尽きる危険性大。ワークライフバランスは崩れやすい。",
        advice: "その熱意は大きな武器。ただし、自分を守ることもチームにとって大事。休息も仕事の一部と考えよう！"
      }
    }
  }
  
  const config = typeConfig[result.type.key as keyof typeof typeConfig] || typeConfig.type1

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-300 via-sky-200 to-purple-300 relative overflow-hidden">
      {/* 背景パターン */}
      <div className="absolute inset-0">
        <div className="absolute -top-1/3 -right-1/4 w-full h-4/5 bg-gradient-to-br from-cyan-200/50 to-sky-300/30 rounded-full transform scale-200 blur-2xl"></div>
        <div className="absolute top-1/4 -left-1/3 w-3/4 h-3/4 bg-gradient-to-tr from-sky-100/40 to-cyan-200/25 rounded-full transform scale-150 blur-2xl"></div>
        <div className="absolute -bottom-1/4 right-1/4 w-2/3 h-2/3 bg-gradient-to-tl from-purple-200/45 to-pink-200/30 rounded-full transform scale-110 blur-xl"></div>
        
        {/* 線的要素 */}
        <div className="absolute top-10 left-10 w-60 h-0.5 bg-white/50 rotate-[20deg]"></div>
        <div className="absolute top-20 left-20 w-100 h-0.5 bg-white/50 rotate-45"></div>
        <div className="absolute top-40 right-20 w-72 h-0.5 bg-white/50 -rotate-[15deg]"></div>
        <div className="absolute bottom-60 left-1/3 w-40 h-0.5 bg-white/50 rotate-30"></div>
        
        {/* 幾何学的要素 */}
        <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-gradient-to-br from-sky-200/30 to-cyan-300/20 transform rotate-12 blur-lg border border-white/20"></div>
        <div className="absolute bottom-1/3 left-1/2 w-24 h-24 bg-gradient-to-tl from-purple-200/25 to-pink-200/20 transform -rotate-45 blur-md border border-white/15"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        {/* メインコンテナ */}
        <div className="bg-gradient-to-br from-sky-300/60 via-purple-400/50 to-pink-500/60 backdrop-blur-xl rounded-3xl shadow-lg border border-white/25 p-10">
          
          {/* ヘッダー */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-semibold text-white mb-6 tracking-wide drop-shadow-2xl">
              診断結果
            </h1>
            <p className="text-xl font-semibold text-white/90 drop-shadow-lg">
              {userName}さんの社畜診断が完了しました！
            </p>
            <p className="text-white/90 font-semibold mt-3 drop-shadow">
              診断日時: {new Date(result.createdAt).toLocaleString('ja-JP')}
            </p>
          </div>

          {/* メイン画像セクション - 大きく目立たせる */}
          <div className="text-center mb-12">
            <div className="relative inline-block w-full max-w-4xl mx-auto">
              {/* 大きな背景装飾 */}
              <div className={`absolute -inset-7 bg-gradient-to-r ${config.color} rounded-3xl blur-2xl opacity-25 animate-pulse`}></div>
              <div className={`absolute -inset-5 bg-gradient-to-r ${config.color} rounded-3xl blur-xl opacity-15`}></div>
              
              {/* メイン画像コンテナ */}
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border-2 border-white/60">
                <img
                  src={config.imagePath}
                  alt={result.type.name}
                  className="block rounded-3xl shadow-none object-contain w-full h-auto max-w-5xl mx-auto"
                  style={{ aspectRatio: '965/544' }}
                />
              </div>
              
              {/* 装飾的なアクセント - より大きく */}
              <div className={`absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-r ${config.color} rounded-full shadow-xl opacity-90`}></div>
              <div className={`absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-r ${config.color} rounded-full shadow-lg opacity-70`}></div>
              <div className={`absolute top-12 -left-8 w-10 h-10 bg-gradient-to-r ${config.color} rounded-full shadow-lg opacity-50`}></div>
            </div>
          </div>

          {/* 結果表示 - タイトルとスコアを横並びに */}
          <div className={`p-8 bg-gradient-to-r ${config.bgGradient} backdrop-blur-sm rounded-3xl ${config.borderColor} border transition-all duration-300 shadow-lg mb-10`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between text-center lg:text-left">
              
              {/* タイトルセクション */}
              <div className="mb-8 lg:mb-0 lg:mr-12">
                <h2 className="font-semibold text-white/95 text-5xl drop-shadow-lg mb-6">
                  {result.type.name}
                </h2>
                <p className="text-2xl text-white/85 drop-shadow-sm leading-relaxed">
                  {config.advice}
                </p>
              </div>
              
              {/* スコア表示 */}
              <div className="text-center lg:text-right">
                <div className="text-xl text-white/90 font-medium mb-4">スコア</div>
                <div className="relative">
                  <div className="text-7xl font-light text-white/95 mb-6 drop-shadow-lg">
                    {result.scores}
                    <span className="text-3xl text-white/70 ml-2">点</span>
                  </div>
                  
                  {/* 進捗バー */}
                  <div className="w-56 mx-auto lg:mx-0">
                    <div className="bg-white/20 rounded-full h-8 border border-white/30 overflow-hidden">
                      <div 
                        className={`bg-gradient-to-r ${config.color} h-8 rounded-full shadow-sm transition-all duration-1000 relative`}
                        style={{width: `${result.scores}%`}}
                      >
                        <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-white/60 font-semibold text-sm mt-3">
                      <span>0</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 詳細分析セクション */}
          <div className="bg-gradient-to-r from-white/15 via-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 mb-10 border border-white/30">
            <h3 className="text-3xl font-semibold text-white/90 mb-6 drop-shadow-lg">
              📋 詳細分析
            </h3>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-cyan-200/10 via-cyan-100/5 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-cyan-300/20">
                <div className="text-sky-100 text-xl font-semibold mb-3 drop-shadow">特徴</div>
                <div className="text-white/90 font-semibold leading-relaxed drop-shadow">{config.details.characteristic}</div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-200/10 via-green-100/5 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-green-300/20">
                  <div className="text-cyan-100 text-xl font-semibold mb-3 drop-shadow">強み</div>
                  <div className="text-white/90 font-semibold leading-relaxed drop-shadow">{config.details.strengths}</div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-200/10 via-yellow-100/5 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-yellow-300/20">
                  <div className="text-white/90 text-xl font-semibold mb-3 drop-shadow">弱み</div>
                  <div className="text-white/90 font-semibold leading-relaxed drop-shadow">{config.details.weaknesses}</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-200/10 via-purple-100/5 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-purple-300/20">
                <div className="text-purple-100 text-xl font-semibold mb-3 drop-shadow">アドバイス</div>
                <div className="text-white/90 font-semibold leading-relaxed drop-shadow">{config.details.advice}</div>
              </div>
            </div>
          </div>

          {/* 詳細レポート */}
          <div className="bg-gradient-to-r from-white/15 via-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 mb-10 border border-white/30">
            <h3 className="text-2xl font-semibold text-white/90 mb-6 drop-shadow-lg">
              📊 診断データ
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-cyan-200/10 via-cyan-100/5 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-cyan-300/20">
                <div className="text-cyan-200 text-sm font-semibold mb-2 drop-shadow">タイプ</div>
                <div className="text-white/90 text-lg font-semibold drop-shadow">{result.type.name}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-200/10 via-purple-100/5 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-purple-300/20">
                <div className="text-purple-200 text-sm font-semibold mb-2 drop-shadow">スコア</div>
                <div className="text-white/90 text-lg font-semibold drop-shadow">{result.scores}点 / 100点</div>
              </div>
              <div className="bg-gradient-to-br from-pink-200/10 via-pink-100/5 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-pink-300/20">
                <div className="text-pink-200 text-sm font-semibold mb-2 drop-shadow">診断日</div>
                <div className="text-white/90 text-lg font-semibold drop-shadow">{new Date(result.createdAt).toLocaleDateString('ja-JP')}</div>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="space-y-6">
            <button
              onClick={onRestart}
              className="w-full bg-gradient-to-r from-cyan-500/80 to-purple-600/80 backdrop-blur-2xl hover:from-cyan-400/90 hover:to-purple-500/90 border border-cyan-400/50 text-white font-medium py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 drop-shadow-lg"
            >
              🔄 もう一度診断
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gradient-to-r from-white/15 via-white/10 to-white/5 hover:from-white/25 hover:via-white/20 hover:to-white/15 backdrop-blur-sm text-white/90 font-medium py-4 px-8 rounded-2xl transition-all duration-300 border border-white/30 hover:border-white/50 drop-shadow"
            >
              ← トップに戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}