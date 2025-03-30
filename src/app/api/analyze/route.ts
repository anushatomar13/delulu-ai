import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { scenario } = await req.json();

    if (!scenario) {
      return NextResponse.json({ error: "Scenario is required" }, { status: 400 });
    }

    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/michellejieli/emotion_text_classifier",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
        body: JSON.stringify({ inputs: scenario }),
      }
    );

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error("Hugging Face API error:", errorText);
      return NextResponse.json(
        { error: `Hugging Face API error: ${hfResponse.status}`, details: errorText },
        { status: 502 }
      );
    }

    const hfData = await hfResponse.json();

    if (!Array.isArray(hfData) || !Array.isArray(hfData[0])) {
      console.error("Unexpected Hugging Face response format:", hfData);

      if (hfData.error && hfData.error.includes("is currently loading")) {
        return NextResponse.json(
          { error: "Model is still loading, please try again in a few moments" },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: "Invalid response format from Hugging Face", details: hfData },
        { status: 500 }
      );
    }

    if (hfData.length === 0 || hfData[0].length === 0) {
      return NextResponse.json(
        { error: "Empty response from Hugging Face" },
        { status: 500 }
      );
    }

    const topEmotions = hfData[0]
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 3);

    const redFlags = ["anger", "disgust", "fear", "sadness"];
    const greenFlags = ["joy", "love", "surprise"];

    const topEmotion = topEmotions[0].label;
    let classification = "⚖️ Neutral. Context matters.";

    if (redFlags.includes(topEmotion)) {
      classification = "🚨 Red Flag! Be cautious.";
    } else if (greenFlags.includes(topEmotion)) {
      classification = "✅ Green Flag! Looks good.";
    }

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
            content: `Analyze this crush scenario and determine whether it's realistic or just delulu. Give a short reasoning in GenZ style language for the conclusion. Scenario: "${scenario}".
            Also, the detected emotions are: ${topEmotions.map((e: any) => e.label).join(", ")}.
            Based on these emotions, this is classified as: ${classification}`
          }
        ],
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API error:", errorText);
      return NextResponse.json(
        { error: `Groq API error: ${groqResponse.status}`, details: errorText },
        { status: 502 }
      );
    }

    const groqData = await groqResponse.json();
    console.log("Groq API Response:", JSON.stringify(groqData, null, 2));

    if (!groqData.choices || groqData.choices.length === 0) {
      return NextResponse.json(
        { error: "Invalid response from Groq API", details: groqData },
        { status: 500 }
      );
    }

    return NextResponse.json({
      emotions: topEmotions,
      classification,
      groqMessage: groqData.choices[0].message.content
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Error processing request", details: (error as Error).message },
      { status: 500 }
    );
  }
}