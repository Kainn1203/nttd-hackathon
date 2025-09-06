"use client";

import React from "react";
import Image from "next/image";

interface DiagnosisResultsProps {
  userName: string;
  result: {
    id: number;
    userId: number;
    scores: number;
    type: {
      key: string;
      name: string;
    };
    createdAt: string;
  };
  onRestart: () => void;
}

export default function DiagnosisResults({
  userName,
  result,
  onRestart,
}: DiagnosisResultsProps) {
  // タイプに応じた表示設定
  const typeConfig = {
    type1: {
      icon: "🌸",
      color: "from-green-300 to-green-400",
      bgGradient: "from-green-200/15 via-green-100/10 to-white/5",
      borderColor: "border-green-300/30",
      image: "/images/result_score_v1_transparent.png", // 画像1: ワークライフバランス重視
      advice: "自分のペース最優先、マイライフイズマイライフ",
      details: {
        characteristic:
          "仕事よりもプライベートをしっかり優先できるあなたは、残業や同調圧力には染まりにくく、心の平和を守る達人です",
        strengths:
          "ストレス耐性が高く、燃え尽きにくい。オン・オフの切り替えが明快。自分らしさを大事にしながら働ける。",
        weaknesses:
          "周囲から「やる気がない？」と誤解されることも。チームプレイより個人プレイを重視しがち。",
        advice:
          "マイペースを活かしつつ、時にはチームの期待に応える姿勢を見せると信頼度UP。",
      },
    },
    type2: {
      icon: "💕",
      color: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-200/15 via-blue-100/10 to-white/5",
      borderColor: "border-blue-400/40",
      image: "/images/result_score_v2_transparent.png", // 画像2: 残業体質
      advice: "定時ダッシュは正義、メリハリこそ力の源",
      details: {
        characteristic:
          "仕事はきちんとやるけど、残業は極力しないあなたは、プライベートと仕事をきっちり分けるメリハリ型です✨",
        strengths:
          "効率を重視して仕事を片付ける。時間意識が高く、スケジュール管理が得意。",
        weaknesses:
          "柔軟性に欠けると「冷たい人」と思われることも…。突発的な残業対応が苦手。",
        advice:
          "定時ダッシュを貫くなら「成果で示す」のが鍵！結果を出していれば誰も文句を言えない！",
      },
    },
    type3: {
      icon: "⚡",
      color: "from-yellow-300 to-yellow-400",
      bgGradient: "from-yellow-200/15 via-yellow-100/10 to-white/5",
      borderColor: "border-yellow-300/30",
      image: "/images/result_score_v3_transparent.png", // 画像3: 効率重視
      advice: "効率命！リソースを最大化するスマートワーカー",
      details: {
        characteristic:
          "時間対効果（タイムパフォーマンス）を最重要視。残業は悪、効率化は善という思想を持っているはず✨",
        strengths:
          "優先順位付けが得意で、生産性の高いアウトプットを出せる。無駄を嫌うので改善アイデアも豊富。",
        weaknesses:
          "効率にこだわりすぎて、人間関係のしがらみや「情」に弱い。人によってはドライに見えてしまうことも…。",
        advice:
          "効率の裏に「人との協調」も少し意識すると、さらに評価が高まる！",
      },
    },
    type4: {
      icon: "😅",
      color: "from-orange-300 to-orange-400",
      bgGradient: "from-orange-200/15 via-orange-100/10 to-white/5",
      borderColor: "border-orange-300/30",
      image: "/images/result_score_v4_transparent.png", // 画像4: バランス型
      advice: "責任感は強い、でも無理はしがちな現実派",
      details: {
        characteristic:
          "必要があれば残業もいとわない。周囲に合わせて行動できるバランスタイプ。",
        strengths:
          "協調性と責任感があり、チームからの信頼度が高い。状況に応じて柔軟に動ける。",
        weaknesses:
          "頑張りすぎて心身を削ることも。周囲の期待に応えようとして、自分を後回しにしがち。",
        advice:
          "残業は美徳ではなく選択肢のひとつ。無理せず「やるべきこととやらないこと」を整理すると持続可能。",
      },
    },
    type5: {
      icon: "👑",
      color: "from-red-300 to-red-400",
      bgGradient: "from-red-200/15 via-red-100/10 to-white/5",
      borderColor: "border-red-300/30",
      image: "/images/result_score_v5_transparent.png", // 画像5: 仕事中毒
      advice: "働くことが生きがい！自己犠牲すらも厭わぬ使命感タイプ",
      details: {
        characteristic:
          "残業や休日出勤を「頑張りの証」と捉える。チームのためなら自分を犠牲にすることもいとわない。",
        strengths:
          "圧倒的な責任感と根性。どんな状況でも踏ん張れる。周囲から「頼れる人」と見られる。",
        weaknesses:
          "自分を追い込みすぎて燃え尽きる危険性大。ワークライフバランスは崩れやすい。",
        advice:
          "その熱意は大きな武器。ただし、自分を守ることもチームにとって大事。休息も仕事の一部と考えよう！",
      },
    },
  };

  const config =
    typeConfig[result.type.key as keyof typeof typeConfig] || typeConfig.type1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-300 via-sky-200 to-purple-300 relative overflow-hidden">
      {/* 背景パターン */}
      <div className="absolute inset-0">
        <div className="absolute -top-1/3 -right-1/4 w-full h-4/5 bg-gradient-to-br from-cyan-200/50 to-sky-300/30 rounded-full transform scale-200 blur-2xl"></div>
        <div className="absolute top-1/4 -left-1/3 w-3/4 h-3/4 bg-gradient-to-tr from-sky-100/40 to-cyan-200/25 rounded-full transform scale-150 blur-2xl"></div>
        <div className="absolute -bottom-1/4 right-1/4 w-2/3 h-2/3 bg-gradient-to-tl from-purple-200/45 to-pink-200/30 rounded-full transform scale-110 blur-xl"></div>

        {/* 線的要素 */}
        <div className="absolute top-10 left-10 w-60 h-0.5 bg-white/50 rotate-[20deg]"></div>
        <div className="absolute top-20 left-20 w-[100px] h-0.5 bg-white/50 rotate-45"></div>
        <div className="absolute top-40 right-20 w-72 h-0.5 bg-white/50 -rotate-[15deg]"></div>
        <div className="absolute bottom-60 left-1/3 w-40 h-0.5 bg-white/50 rotate-[30deg]"></div>
        {/* 幾何学的要素 */}
        <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-gradient-to-br from-sky-200/30 to-cyan-300/20 transform rotate-12 blur-lg border border-white/20"></div>
        <div className="absolute bottom-1/3 left-1/2 w-24 h-24 bg-gradient-to-tl from-purple-200/25 to-pink-200/20 transform -rotate-45 blur-md border border-white/15"></div>
      </div>

      {/* ▼▼ レスポンシブ対応版 ▼▼ */}
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-6 sm:pt-24 sm:pb-8 relative z-10">
        {/* ヘッダー分の余白を追加 */}
        <div className="bg-gradient-to-br from-sky-300/60 via-purple-400/50 to-pink-500/60 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg border border-white/25 p-4 sm:p-6">
          {/* 旧: rounded-3xl p-10 */}

          {/* ヘッダー（文字は見やすく太めのまま） */}
          <div className="text-center mb-6 sm:mb-8">
            {/* 旧: mb-12 */}
            <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-3 sm:mb-4 tracking-wide drop-shadow-2xl">
              {/* 旧: text-5xl mb-6 */}
              診断結果
            </h1>
            <p className="text-base sm:text-lg font-semibold text-white/90 drop-shadow-lg">
              {/* 旧: text-xl */}
              {userName}さんの社畜診断が完了しました！
            </p>
            <p className="text-sm sm:text-base text-white/90 font-semibold mt-2 drop-shadow">
              {/* 旧: mt-3 */}
              診断日時: {new Date(result.createdAt).toLocaleString("ja-JP")}
            </p>
          </div>

          {/* メイン画像セクション */}
          <div className="text-center mb-6 sm:mb-8">
            {/* 旧: mb-12 */}
            <div className="relative inline-block w-full max-w-3xl mx-auto">
              {/* 旧: max-w-4xl */}
              <div
                className={`absolute -inset-2 sm:-inset-4 bg-gradient-to-r ${config.color} rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-25`}
              ></div>
              {/* 旧: -inset-7 */}
              <div
                className={`absolute -inset-1 sm:-inset-3 bg-gradient-to-r ${config.color} rounded-2xl sm:rounded-3xl blur-lg sm:blur-xl opacity-15`}
              ></div>
              {/* 旧: -inset-5 */}
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-2xl border-2 border-white/60">
                {/* 旧: p-6 */}
                <Image
                  src={config.image}
                  alt={result.type.name}
                  width={965}
                  height={544}
                  className="block rounded-2xl sm:rounded-3xl object-contain w-full h-auto max-w-3xl mx-auto"
                  priority
                  unoptimized
                />
              </div>
              <div
                className={`absolute -top-3 -right-3 sm:-top-5 sm:-right-5 w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-r ${config.color} rounded-full shadow-xl opacity-90`}
              ></div>
              {/* 旧: w-16 h-16 */}
              <div
                className={`absolute -bottom-3 -left-3 sm:-bottom-5 sm:-left-5 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r ${config.color} rounded-full shadow-lg opacity-70`}
              ></div>
              {/* 旧: w-12 h-12 */}
              <div
                className={`absolute top-8 -left-5 sm:top-10 sm:-left-7 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r ${config.color} rounded-full shadow-lg opacity-50`}
              ></div>
              {/* 旧: w-10 h-10 */}
            </div>
          </div>

          {/* 結果表示ブロック - タイプを強調 */}
          <div
            className={`p-6 sm:p-8 lg:p-10 bg-gradient-to-r ${config.bgGradient} backdrop-blur-sm rounded-xl sm:rounded-2xl ${config.borderColor} border-2 shadow-2xl mb-6 sm:mb-8 relative overflow-hidden`}
          >
            {/* 装飾的な背景要素 */}
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${config.color} opacity-10 rounded-full blur-3xl`}
            ></div>
            <div
              className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr ${config.color} opacity-10 rounded-full blur-2xl`}
            ></div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between text-center lg:text-left relative z-10">
              <div className="mb-6 sm:mb-8 lg:mb-0 lg:mr-6 sm:lg:mr-10 flex-1">
                {/* タイプアイコンを大きく表示 */}
                <div className="text-5xl sm:text-6xl lg:text-7xl mb-3 sm:mb-4 filter drop-shadow-2xl">
                  {config.icon}
                </div>
                {/* タイプ名をより大きく、より目立つように */}
                <h2 className="font-bold text-white text-3xl sm:text-4xl lg:text-5xl drop-shadow-2xl mb-3 sm:mb-5 tracking-wide">
                  <span
                    className={`bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}
                  >
                    {result.type.name}
                  </span>
                </h2>
                {/* キャッチコピーも少し大きく */}
                <p className="text-lg sm:text-xl lg:text-2xl text-white font-semibold drop-shadow-lg leading-relaxed px-2 sm:px-0">
                  {config.advice}
                </p>
              </div>

              {/* スコア表示 - より目立つデザインに */}
              <div className="text-center lg:text-right bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
                <div className="text-base sm:text-lg text-white font-bold mb-2 sm:mb-3 uppercase tracking-wider drop-shadow">
                  Score
                </div>
                <div className="relative">
                  <div className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-3 sm:mb-5 drop-shadow-2xl">
                    <span
                      className={`bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}
                    >
                      {result.scores}
                    </span>
                    <span className="text-2xl sm:text-3xl text-white/80 ml-1 sm:ml-2 font-medium">
                      点
                    </span>
                  </div>
                  <div className="w-48 sm:w-56 mx-auto lg:mx-0">
                    <div className="bg-white/15 rounded-full h-6 sm:h-8 border-2 border-white/40 overflow-hidden shadow-inner">
                      <div
                        className={`bg-gradient-to-r ${config.color} h-full rounded-full shadow-lg transition-all duration-1000 relative`}
                        style={{ width: `${result.scores}%` }}
                      >
                        <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-white/70 font-bold text-sm mt-2 sm:mt-3">
                      <span>0</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 詳細分析セクション（外観はそのまま） */}
          <div className="bg-gradient-to-r from-white/15 via-white/10 to-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-white/30">
            {/* 旧: mb-10 */}
            <h3 className="text-2xl sm:text-3xl font-semibold text-white/90 mb-4 sm:mb-6 drop-shadow-lg">
              📋 詳細分析
            </h3>
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-gradient-to-br from-cyan-200/10 via-cyan-100/5 to-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-cyan-300/20">
                <div className="text-sky-100 text-lg sm:text-xl font-semibold mb-2 sm:mb-3 drop-shadow">
                  特徴
                </div>
                <div className="text-sm sm:text-base text-white/90 font-semibold leading-relaxed drop-shadow">
                  {config.details.characteristic}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-green-200/10 via-green-100/5 to-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-green-300/20">
                  <div className="text-cyan-100 text-lg sm:text-xl font-semibold mb-2 sm:mb-3 drop-shadow">
                    強み
                  </div>
                  <div className="text-sm sm:text-base text-white/90 font-semibold leading-relaxed drop-shadow">
                    {config.details.strengths}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-200/10 via-yellow-100/5 to-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-yellow-300/20">
                  <div className="text-white/90 text-lg sm:text-xl font-semibold mb-2 sm:mb-3 drop-shadow">
                    弱み
                  </div>
                  <div className="text-sm sm:text-base text-white/90 font-semibold leading-relaxed drop-shadow">
                    {config.details.weaknesses}
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-200/10 via-purple-100/5 to-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-300/20">
                <div className="text-purple-100 text-lg sm:text-xl font-semibold mb-2 sm:mb-3 drop-shadow">
                  アドバイス
                </div>
                <div className="text-sm sm:text-base text-white/90 font-semibold leading-relaxed drop-shadow">
                  {config.details.advice}
                </div>
              </div>
            </div>
          </div>

          {/* 詳細レポート */}
          <div className="bg-gradient-to-r from-white/15 via-white/10 to-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-white/30">
            {/* 旧: mb-10 */}
            <h3 className="text-xl sm:text-2xl font-semibold text-white/90 mb-4 sm:mb-6 drop-shadow-lg">
              📊 診断データ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-cyan-200/10 via-cyan-100/5 to-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-cyan-300/20">
                <div className="text-cyan-200 text-xs sm:text-sm font-semibold mb-1 sm:mb-2 drop-shadow">
                  タイプ
                </div>
                <div className="text-white/90 text-base sm:text-lg font-semibold drop-shadow">
                  {result.type.name}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-200/10 via-purple-100/5 to-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-300/20">
                <div className="text-purple-200 text-xs sm:text-sm font-semibold mb-1 sm:mb-2 drop-shadow">
                  スコア
                </div>
                <div className="text-white/90 text-base sm:text-lg font-semibold drop-shadow">
                  {result.scores}点 / 100点
                </div>
              </div>
              <div className="bg-gradient-to-br from-pink-200/10 via-pink-100/5 to-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-pink-300/20">
                <div className="text-pink-200 text-xs sm:text-sm font-semibold mb-1 sm:mb-2 drop-shadow">
                  診断日
                </div>
                <div className="text-white/90 text-base sm:text-lg font-semibold drop-shadow">
                  {new Date(result.createdAt).toLocaleDateString("ja-JP")}
                </div>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="space-y-4 sm:space-y-6">
            <button
              onClick={onRestart}
              className="w-full bg-gradient-to-r from-cyan-500/80 to-purple-600/80 backdrop-blur-2xl hover:from-cyan-400/90 hover:to-purple-500/90 border border-cyan-400/50 text-white font-medium py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 drop-shadow-lg text-sm sm:text-base"
            >
              🔄 もう一度診断
            </button>

            <button
              onClick={() => (window.location.href = "/")}
              className="w-full bg-gradient-to-r from-white/15 via-white/10 to-white/5 hover:from-white/25 hover:via-white/20 hover:to-white/15 backdrop-blur-sm text-white/90 font-medium py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 border border-white/30 hover:border-white/50 drop-shadow text-sm sm:text-base"
            >
              ← トップに戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
