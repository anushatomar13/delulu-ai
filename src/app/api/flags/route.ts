import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

interface SwipeResult {
  cardId: number;
  scenario: string;
  choice: 'rizz' | 'risk';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { swipeResults }: { swipeResults: SwipeResult[] } = body;

    if (!swipeResults || !Array.isArray(swipeResults)) {
      return NextResponse.json(
        { error: 'Invalid swipeResults data' },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert in detecting "delulu" (delusional) behavior in dating scenarios.
Analyze the following user's swipe choices (💚 = Valid Rizz, ❤️ = Delulu Risk).
Provide a short funny but accurate summary judgment of their mindset.

Data:
${swipeResults.map((r: SwipeResult, i: number) =>
    `Card ${i + 1}: "${r.scenario}" → ${r.choice === 'rizz' ? 'Valid Rizz 💚' : 'Delulu Risk ❤️'}`
  ).join('\n')}

Respond with ONLY a valid JSON object in this exact format:
{
  "judgment": "Your witty analysis here (2-3 sentences max)",
  "deluluRating": 7
}

Do not include any markdown formatting, backticks, or extra text. Just the raw JSON.`;

    const completion = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const aiMessage = completion.choices[0]?.message?.content || '';
    
    // Clean up the response - remove any markdown formatting
    let cleanedMessage = aiMessage.trim();
    
    // Remove markdown code blocks if present
    if (cleanedMessage.includes('```')) {
      const jsonMatch = cleanedMessage.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        cleanedMessage = jsonMatch[1].trim();
      }
    }
    
    // Try to parse the JSON
    let parsed;
    try {
      parsed = JSON.parse(cleanedMessage);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('AI response was:', aiMessage);
      
      // Fallback response
      return NextResponse.json({
        judgment: "🎭 Your dating intuition is... interesting! Some choices were spot-on, others had us raising eyebrows. You're walking the fine line between confidence and delusion!",
        deluluRating: 5
      });
    }

    // Validate the response structure
    if (!parsed.judgment || typeof parsed.deluluRating !== 'number') {
      return NextResponse.json({
        judgment: "🎭 Your dating intuition is a mix of wisdom and wishful thinking! You've got some solid instincts but might be reading into things just a little too much.",
        deluluRating: 6
      });
    }

    return NextResponse.json(parsed);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get AI response',
        judgment: "🤖 AI had a moment there! But based on your choices, you seem to have a good balance of romantic optimism and realistic expectations.",
        deluluRating: 5
      },
      { status: 500 }
    );
  }
}