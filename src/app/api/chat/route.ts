import { NextResponse } from 'next/server'
import { dialogflowService } from '@/lib/dialogflowService'

export async function POST(request: Request) {
  try {
    const { message, sessionId } = await request.json()

    // Use existing session ID or create a new one
    const dfSessionId = sessionId || dialogflowService.createSessionId()

    // Get response from Dialogflow
    const response = await dialogflowService.detectIntent(message, dfSessionId)

    return NextResponse.json({ 
      message: response.text,
      intent: response.intent,
      confidence: response.confidence,
      sessionId: dfSessionId
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
} 