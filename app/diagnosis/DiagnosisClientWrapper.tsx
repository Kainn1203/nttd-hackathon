// app/diagnosis/DiagnosisClientWrapper.tsx (Client Component)
'use client'

import React, { useState } from 'react'
import DiagnosisStart from '@/components/diagnosis/DiagnosisStart'
import DiagnosisForm from '@/components/diagnosis/DiagnosisForm'
import DiagnosisResults from '@/components/diagnosis/DiagnosisResult'

type DiagnosisStep = 'start' | 'form' | 'results'

interface DiagnosisClientWrapperProps {
  userId: number
  userName: string
}

export default function DiagnosisClientWrapper({ userId, userName }: DiagnosisClientWrapperProps) {
  const [currentStep, setCurrentStep] = useState<DiagnosisStep>('start')
  const [currentUserName, setCurrentUserName] = useState(userName)
  const [diagnosisResult, setDiagnosisResult] = useState<{ result: { id: number; userId: number; scores: number; type: { key: string; name: string }; createdAt: string } } | null>(null)

  const handleStart = (displayName: string) => {
    setCurrentUserName(displayName)
    setCurrentStep('form')
  }

  const handleComplete = (result: { result: { id: number; userId: number; scores: number; type: { key: string; name: string }; createdAt: string } }) => {
    setDiagnosisResult(result)
    setCurrentStep('results')
  }

  const handleBack = () => {
    setCurrentStep('start')
  }

  const handleRestart = () => {
    setDiagnosisResult(null)
    setCurrentStep('start')
  }

  switch (currentStep) {
    case 'start':
      return (
        <DiagnosisStart
          userId={userId}
          userName={userName}
          onStart={handleStart}
        />
      )
    
    case 'form':
      return (
        <DiagnosisForm
          userName={currentUserName}
          userId={userId}
          onComplete={handleComplete}
          onBack={handleBack}
        />
      )
    
    case 'results':
      if (!diagnosisResult) {
        return <div>エラー: 診断結果がありません</div>
      }
      
      return (
        <DiagnosisResults
          userName={currentUserName}
          result={diagnosisResult.result}
          onRestart={handleRestart}
        />
      )
      
    default:
      return (
        <DiagnosisStart
          userId={userId}
          userName={userName}
          onStart={handleStart}
        />
      )
  }
}