'use client'


import React, { useState, useEffect } from 'react'


interface DiagnosisFormProps {
  userName: string
  userId: number
  onComplete: (result: any) => void
  onBack: () => void
}


export default function DiagnosisForm({ userName, userId, onComplete, onBack }: DiagnosisFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{[key: number]: 1|2|3}>({})
  const [loading, setLoading] = useState(false)
  const [shuffledQuestions, setShuffledQuestions] = useState<any[]>([])


  // Fisher-Yates シャッフルアルゴリズム
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }


  // 質問データ
  const questions = [
    {
      id: 1,
      text: "残業や休日出勤について、どう思う？",
      options: [
        { text: "頑張りの証だと思う", value: 1 as const },
        { text: "仕方ないときは受け入れる", value: 2 as const },
        { text: "基本的にやりたくない！", value: 3 as const }
      ]
    },
    {
      id: 2,
      text: "先輩に飲み会や残業に誘われたら？",
      options: [
        { text: "予定があっても断りにくい...", value: 1 as const },
        { text: "調整して参加する", value: 2 as const },
        { text: "自分の予定を優先する", value: 3 as const }
      ]
    },
    {
      id: 3,
      text: "チームのために自分の予定をどうしますか？",
      options: [
        { text: "予定を後回しにしてでもチームを優先する", value: 1 as const },
        { text: "調整して両立させたい", value: 2 as const },
        { text: "自分の予定を優先する", value: 3 as const }
      ]
    },
    {
      id: 4,
      text: "寝不足と課題のどちらを優先しますか？",
      options: [
        { text: "睡眠時間を削ってでも課題を終わらせる", value: 1 as const },
        { text: "できるだけ両立させたい", value: 2 as const },
        { text: "睡眠を優先する", value: 3 as const }
      ]
    },
    {
      id: 5,
      text: "定時になったけど仕事が残っているとき、どうしますか？",
      options: [
        { text: "残業して終わらせる", value: 1 as const },
        { text: "緊急度によっては残る", value: 2 as const },
        { text: "明日に回す", value: 3 as const }
      ]
    },
    {
      id: 6,
      text: "先輩の意見が自分の考えと違ったら？",
      options: [
        { text: "先輩には絶対逆らえない...", value: 1 as const },
        { text: "遠回しに自分の意見を伝える", value: 2 as const },
        { text: "自分の考えをはっきり主張する", value: 3 as const }
      ]
    },
    {
      id: 7,
      text: "同期がまだ残っているとき、自分だけ帰れますか？",
      options: [
        { text: "同期が頑張ってるのに帰るわけない", value: 1 as const },
        { text: "様子次第で帰るか決める", value: 2 as const },
        { text: "自分の仕事が終わってるなら即帰宅", value: 3 as const }
      ]
    },
    {
      id: 8,
      text: "仕事とプライベートのバランスについてどう思いますか？",
      options: [
        { text: "仕事が生活の大部分でも気にしない", value: 1 as const },
        { text: "仕事とプライベートは半々くらいがいい", value: 2 as const },
        { text: "プライベートを優先したい", value: 3 as const }
      ]
    },
    {
      id: 9,
      text: "成長やスキルアップのために、どのくらい頑張れる？",
      options: [
        { text: "何を犠牲にしても頑張れる", value: 1 as const },
        { text: "無理のない範囲だったら頑張る", value: 2 as const },
        { text: "自分のペースを大事にしたい", value: 3 as const }
      ]
    },
    {
      id: 10,
      text: "上司からのLINEに既読無視されたら？",
      options: [
        { text: "ずっと気になる", value: 1 as const },
        { text: "少し気になるけど、すぐ切り替え", value: 2 as const },
        { text: "あまり気にしない", value: 3 as const }
      ]
    }
  ];


  // コンポーネント初期化時に選択肢をシャッフル
  useEffect(() => {
    const questionsWithShuffledOptions = questions.map(question => ({
      ...question,
      options: shuffleArray(question.options)
    }))
    setShuffledQuestions(questionsWithShuffledOptions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const handleAnswer = async (questionIndex: number, answerValue: 1|2|3) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answerValue }))
   
    if (questionIndex < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(questionIndex + 1), 300)
    } else {
      await completeDiagnosis(answerValue)
    }
  }


  const completeDiagnosis = async (finalAnswer: 1|2|3) => {
    setLoading(true)
   
    try {
      const allAnswers = { ...answers, [currentQuestion]: finalAnswer }
      const answersArray: (1|2|3)[] = Array.from({ length: 10 }, (_, i) => allAnswers[i])


      const response = await fetch('/api/corporate_diagnosis/diagnosis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          answers: answersArray
        })
      })


      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '診断の保存に失敗しました')
      }


      const result = await response.json()
      onComplete({
        userName,
        result,
        answers: allAnswers
      })
     
    } catch (error: any) {
      console.error('診断完了処理エラー:', error)
      alert(`診断結果の保存に失敗しました: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-300 via-sky-200 to-purple-300 flex items-center justify-center relative overflow-hidden">
        {/* 背景パターン */}
        <div className="absolute inset-0">
          <div className="absolute -top-1/2 -right-1/4 w-full h-full bg-gradient-to-br from-cyan-200/60 to-sky-300/40 rounded-full transform scale-150 blur-3xl"></div>
          <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-gradient-to-br from-white/20 to-cyan-200/30 transform rotate-45 blur-xl"></div>
          <div className="absolute -bottom-1/3 -left-1/4 w-0 h-0 border-l-[200px] border-r-[200px] border-b-[300px] border-l-transparent border-r-transparent border-b-purple-200/40 transform rotate-12 blur-2xl"></div>
        </div>
       
        <div className="bg-gradient-to-br from-white/20 via-cyan-50/15 to-sky-100/10 backdrop-blur-2xl rounded-3xl shadow-lg p-8 text-center border border-white/30 relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white/90 font-medium drop-shadow">診断結果を計算中...</p>
        </div>
      </div>
    )
  }


  if (shuffledQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-300 via-sky-200 to-purple-300 flex items-center justify-center">
        <div className="bg-gradient-to-br from-white/20 via-cyan-50/15 to-sky-100/10 backdrop-blur-2xl rounded-3xl shadow-lg p-8 text-center border border-white/30">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white/90 font-medium drop-shadow">質問を準備中...</p>
        </div>
      </div>
    )
  }


  const progress = ((currentQuestion + 1) / questions.length) * 100


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
      </div>


      {/* ▼▼ ここから“カードが大きい”対策（サイズのみ最小変更） ▼▼ */}
      <div className="max-w-2xl mx-auto px-4 py-6 relative z-10">{/* 旧: max-w-4xl px-6 py-12 */}
        <div className="bg-gradient-to-br from-sky-300/60 via-purple-400/50 to-pink-500/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/25 p-6">{/* 旧: rounded-3xl p-8 */}
          {/* ヘッダー */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={onBack}
              className="text-white/90 hover:text-white text-base font-semibold drop-shadow transition-all duration-200 hover:scale-105">{/* 旧: text-lg font-semibold */}
              ← 戻る
            </button>
            <h2 className="text-xl font-semibold text-white/90 drop-shadow-lg">{/* 旧: text-2xl */}
              質問 {currentQuestion + 1} / {questions.length}
            </h2>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">{/* 旧: px-4 py-2 */}
              <span className="text-white/90 font-semibold drop-shadow">
                {userName}さん
              </span>
            </div>
          </div>
         
          {/* プログレスバー */}
          <div className="w-full bg-white/20 rounded-full h-3 border border-white/30">{/* 旧: h-4 */}
            <div
              className="bg-gradient-to-r from-cyan-400 to-purple-500 h-3 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-right font-semibold text-white/80 text-sm drop-shadow">{/* 旧: text-base */}
            {Math.round(progress)}% 完了
          </div>


          {/* 質問部分 */}
          <div className="mb-4">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4 drop-shadow-lg">{/* 旧: text-6xl */}
                {['💼', '🍻', '👥', '😴', '⏰', '💭', '👥', '⚖️', '🚀', '📱'][currentQuestion]}
              </div>
              <h3 className="text-2xl font-semibold text-white/95 leading-relaxed drop-shadow-lg max-w-xl mx-auto">{/* 旧: text-3xl */}
                {shuffledQuestions[currentQuestion].text}
              </h3>
            </div>


            {/* 選択肢 */}
            <div className="space-y-3">
              {shuffledQuestions[currentQuestion].options.map(
                (opt: { text: string; value: 1|2|3 }, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(currentQuestion, opt.value)}
                    className="w-full text-left bg-white/20 hover:bg-white/30 active:bg-white/40 border border-white/30 rounded-xl px-4 py-3 transition-all duration-150 backdrop-blur drop-shadow-sm"
                  >
                    <span className="text-white/95">{opt.text}</span>
                   
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      {/* ▲▲ サイズのみ最小変更ここまで ▲▲ */}
    </div>
  )
}

