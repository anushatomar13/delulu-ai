import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const scenario = formData.get("scenario") as string;
    const file = formData.get("file") as File | null;

    if (!scenario) {
      return NextResponse.json({ error: "Scenario is required" }, { status: 400 });
    }

    console.log("Received scenario:", scenario);
    console.log("Received file:", file ? file.name : "No file uploaded");

    let topEmotions = [
      { label: "neutral", score: 0.5 },
      { label: "joy", score: 0.3 },
      { label: "surprise", score: 0.2 }
    ];
    let classification = "⚖️ Neutral. Context matters.";

    // HuggingFace API with manual timeout
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const hfResponse = await fetch(
        "https://api-inference.huggingface.co/models/michellejieli/emotion_text_classifier",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          },
          body: JSON.stringify({ inputs: scenario }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

      if (hfResponse.ok) {
        const hfData = await hfResponse.json();

        if (Array.isArray(hfData) && Array.isArray(hfData[0]) && hfData[0].length > 0) {
          topEmotions = hfData[0]
            .sort((a: any, b: any) => b.score - a.score)
            .slice(0, 3);

          const redFlags = ["anger", "disgust", "fear", "sadness"];
          const greenFlags = ["joy", "love", "surprise"];
          const topEmotion = topEmotions[0].label;

          if (redFlags.includes(topEmotion)) {
            classification = "🚨 Red Flag! Be cautious.";
          } else if (greenFlags.includes(topEmotion)) {
            classification = "✅ Green Flag! Looks good.";
          }
        } else {
          console.log("Using default emotions due to unexpected HF response format");
        }
      } else {
        console.log("Using default emotions due to HF API error:", hfResponse.status);
      }
    } catch (error) {
      console.error("HuggingFace API error:", error);
    }

    // Groq API with manual timeout
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

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
              content: `You're my Gen Z bestie who’s always real, dropping truth bombs like we’re gossiping over coffee. I just told you this crush scenario: "${scenario}". Pick up on the emotions — ${topEmotions.map((e: any) => e.label).join(", ")} — and give me a quick reality check. Is this delulu or realistic? Talk to me like you’re sending a voice note, keeping it chill, sassy, and straight-up. Don't use words like "hey girl" as it can be a person of any gender using the feature". Use a couple of emojis for flavor 😎, but don’t overdo it. Don’t force the slang — just sound like you’re hyping me up or lovingly dragging me. If it’s got potential, gas me up; if it’s wild, keep it 100. End with a clear verdict: "Totally delulu" or "Not delulu, go for it."`
            }
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        console.error("Groq API error:", errorText);

        return NextResponse.json({
          error: "AI service temporarily unavailable",
          emotions: topEmotions,
          classification,
          errorMessage: "Sorry, I couldn't analyze your scenario right now. But it sounds like a mix of " +
            topEmotions.map((e: any) => e.label).join(", ") + ". " +
            "Based on this, " + classification + " Try again in a few moments?",
          success: false
        }, { status: 503 });
      }

      const groqData = await groqResponse.json();

      if (!groqData.choices || groqData.choices.length === 0) {
        return NextResponse.json({
          error: "AI service returned invalid response",
          emotions: topEmotions,
          classification,
          errorMessage: "Sorry, I couldn't analyze your scenario right now. But it sounds like a mix of " +
            topEmotions.map((e: any) => e.label).join(", ") + ". " +
            "Based on this, " + classification + " Try again in a few moments?",
          success: false
        }, { status: 503 });
      }

      const result = {
        emotions: topEmotions,
        classification,
        groqMessage: groqData.choices[0].message.content,
        message: groqData.choices[0].message.content,
        success: true
      };

      return NextResponse.json(result);
    } catch (error) {
      console.error("Groq fetch error:", error);

      return NextResponse.json({
        error: "Network error while processing request",
        emotions: topEmotions,
        classification,
        errorMessage: "Sorry, I couldn't analyze your scenario right now. But it sounds like a mix of " +
          topEmotions.map((e: any) => e.label).join(", ") + ". " +
          "Based on this, " + classification + " Try again in a few moments?",
        success: false
      }, { status: 503 });
    }

  } catch (error) {
    console.error("Unhandled API route error:", error);
    return NextResponse.json(
      {
        error: "Error processing request",
        details: (error as Error).message,
        errorMessage: "Sorry, something went wrong. Please try again later.",
        success: false
      },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
