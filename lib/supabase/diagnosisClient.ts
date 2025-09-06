// lib/supabase/diagnosisClient.ts
export class DiagnosisAPI {
  static async saveDiagnosis(userId: number, answers: (1|2|3)[]) {
    const response = await fetch('/api/corporate_diagnosis/diagnosis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, answers })
    })
    
    if (!response.ok) {
      throw new Error('診断保存に失敗しました')
    }
    
    return response.json()
  }

  static async getHistory(userId: number) {
    const response = await fetch(`/api/corporate_diagnosis/history?userId=${userId}`)
    return response.json()
  }
}