import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const scenario = formData.get('scenario') as string;
    const file = formData.get('file') as File | null;

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
    
    try {
      const hfResponse = await fetch(
        "https://api-inference.huggingface.co/models/michellejieli/emotion_text_classifier",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          },
          body: JSON.stringify({ inputs: scenario }),
          signal: AbortSignal.timeout(5000),
        }
      );

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
      console.error("Error with emotion analysis, using defaults:", error);
    }

    try {
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
        signal: AbortSignal.timeout(10000),
      });

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        console.error("Groq API error:", errorText);
        
        return NextResponse.json({
          emotions: topEmotions,
          classification,
          groqMessage: "Sorry, I couldn't analyze your scenario right now. But it sounds like a mix of " + 
                       topEmotions.map((e: any) => e.label).join(", ") + ". " + 
                       "Based on this, " + classification + " Try again in a few moments?",
          message: "Sorry, I couldn't analyze your scenario right now. Try again in a few moments?"
        });
      }

      const groqData = await groqResponse.json();

      if (!groqData.choices || groqData.choices.length === 0) {
        return NextResponse.json({
          emotions: topEmotions,
          classification,
          groqMessage: "Sorry, I couldn't analyze your scenario right now. But it sounds like a mix of " + 
                       topEmotions.map((e: any) => e.label).join(", ") + ". " + 
                       "Based on this, " + classification + " Try again in a few moments?",
          message: "Sorry, I couldn't analyze your scenario right now. Try again in a few moments?"
        });
      }

      const result = {
        emotions: topEmotions,
        classification,
        groqMessage: groqData.choices[0].message.content,
        message: groqData.choices[0].message.content 
      };

      return NextResponse.json(result);
      
    } catch (error) {
      console.error("Groq API error:", error);
      
      return NextResponse.json({
        emotions: topEmotions,
        classification,
        groqMessage: "Sorry, I couldn't analyze your scenario right now. But it sounds like a mix of " + 
                     topEmotions.map((e: any) => e.label).join(", ") + ". " + 
                     "Based on this, " + classification + " Try again in a few moments?",
        message: "Sorry, I couldn't analyze your scenario right now. Try again in a few moments?"
      });
    }
    
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { 
        error: "Error processing request", 
        details: (error as Error).message,
        message: "Sorry, something went wrong. Please try again later."
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