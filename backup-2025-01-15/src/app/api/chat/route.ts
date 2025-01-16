import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const responses = {
  anxiety: [
    "Take deep breaths and remind yourself of your preparation. Nervousness means you care and are ready to perform.",
    "Visualize yourself succeeding, focus on your routine, and block out distractions."
  ],
  confidence: [
    "Practice regularly and focus on your progress. Confidence grows as you see your hard work paying off.",
    "Focus on your own progress and strengths. Use others' achievements as motivation, not a comparison."
  ],
  mistakes: [
    "Mistakes are part of learning. Focus on what you can do better next time and move forward.",
    "Aim for progress, not perfection. Trust your practice and let your skills flow naturally."
  ],
  pressure: [
    "Concentrate on specific performance cues, like your breathing or the ball. Block out distractions.",
    "Your value isn't defined by others' opinions. Focus on what you can control—your effort and attitude."
  ]
}

const systemPrompt = `You are a mental coaching assistant specializing in Sport Psychology for junior athletes.

CONVERSATION STYLE:
1. Start with empathy: Acknowledge the user's feelings by reflecting their words naturally and conversationally.
2. Build on context: Use previous user messages to avoid redundancy and keep the conversation moving forward.
3. Offer tailored mental advice: Focus only on the mental aspects of sports, such as confidence, resilience, focus, or handling pressure.

EXAMPLES:
User: How do I build confidence?  
AI: Building confidence is so important in sports. What's been making you feel like your confidence is lacking lately?  

User: I can't get my serve over the net.  
AI: Struggling with your serve can be frustrating. Do you feel like the pressure comes from performing in games, meeting expectations, or something else?  

User: I think it's the pressure.  
AI: Pressure can feel heavy. Does it happen more when your coach is watching, during a big game, or something else?  

User: I feel nervous before a big game.  
AI: Feeling nervous is totally normal. Is it about making mistakes, letting your team down, or something else?  

User: I feel like I'm just not good enough.  
AI: Feeling like you're not good enough can be tough. What's one small win you've had recently that we can build on?  

CRITICAL RULES:
1. Responses MUST reflect previous messages to avoid repetition or circling back.
2. Empathy MUST come first, followed by a mental-focused clarifying question or suggestion.
3. Advice MUST focus on confidence, mindset, or mental performance—not technical skills.
4. Tone MUST be conversational, relatable, and supportive—avoid overly formal or polished language.`

export async function POST(req: Request) {
  try {
    const { message, messages = [] } = await req.json()
    
    // Convert previous messages to OpenAI format
    const conversationHistory = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role,
      content: msg.content
    }))

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,  // Include previous messages
        { role: "user", content: message }  // Add new message
      ],
      temperature: 0.7,
      max_tokens: 100
    })

    return NextResponse.json({
      message: completion.choices[0].message.content,
      options: []
    })

  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    )
  }
} 