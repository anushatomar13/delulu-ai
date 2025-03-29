import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { scenario } = await req.json();

    if (!scenario) {
      return NextResponse.json({ error: "Scenario is required" }, { status: 400 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { 
            role: "user", 
            content: `Analyze this crush scenario and determine whether it's realistic or just delulu. Give a short reasoning in GenZ style language for the conclusion. Scenario: "${scenario}".`
          }
        ],
      }),
    });

    const data = await response.json();
    console.log("Groq API Response:", JSON.stringify(data, null, 2));

    if (data.choices && data.choices.length > 0) {
      return NextResponse.json({ message: data.choices[0].message.content });
    } else {
      return NextResponse.json({ error: "Invalid response from Groq API", fullResponse: data }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Error fetching data", details: (error as Error).message }, { status: 500 });
  }
}
