import { NextRequest, NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { scenario } = await req.json();
    
    if (!scenario?.trim()) {
      return Response.json(
        { error: "Scenario text is required" },
        { status: 400 }
      );
    }

    // Add rate limiting check here if needed
    const analysisResult = await analyzeWithAI(scenario);

    return Response.json(analysisResult);
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

async function analyzeWithAI(scenario: string) {
  try {
    const groqResponse = await fetch('https://api.groq.com/analyze', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.GROQ_KEY}` },
      body: JSON.stringify({ text: scenario }),
    });

    if (!groqResponse.ok) {
      throw new Error(`AI service error: ${groqResponse.statusText}`);
    }

    return await groqResponse.json();
  } catch (error) {
    console.error('AI Service Error:', error);
    throw new Error('Failed to analyze scenario with AI service');
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};