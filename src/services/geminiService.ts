import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";
import { enforceStrictLabel } from "./validationService";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Please configure it in your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export async function analyzeTextWithGemini(text: string): Promise<AnalysisResult> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `You are an AI text analysis system.
Determine if the text is AI-generated or Human-written.

INPUT TEXT:
${text}

STRICT REQUIREMENTS:
1. Return ONLY "AI-generated" or "Human-written".
2. Break the ENTIRE input text into segments (sentences or paragraphs).
3. For EVERY segment, provide a label ('ai' or 'human') and a score (0 to 1).
4. The concatenation of all 'text' fields in 'segments' MUST equal the original input text.
5. Return JSON format.` }]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER, description: "AI Probability (0-100)" },
          classification: { 
            type: Type.STRING, 
            enum: ["AI-generated", "Human-written"],
            description: "Final classification. MUST be exactly 'AI-generated' or 'Human-written'."
          },
          segments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                score: { type: Type.NUMBER, description: "Probability that this sentence is AI-generated (0 to 1)" },
                label: { type: Type.STRING, enum: ["human", "ai"] },
                explanation: { type: Type.STRING, description: "Brief reasoning for this segment's label" }
              },
              required: ["text", "score", "label", "explanation"]
            }
          },
          explanation: { type: Type.STRING, description: "2-3 sentences explaining the decision" },
          metrics: {
            type: Type.OBJECT,
            properties: {
              perplexity: { type: Type.NUMBER },
              burstiness: { type: Type.NUMBER },
              coherence: { type: Type.NUMBER }
            },
            required: ["perplexity", "burstiness", "coherence"]
          }
        },
        required: ["overallScore", "classification", "segments", "explanation", "metrics"]
      }
    }
  });

  const result = JSON.parse(response.text || "{}");
  
  // Validation logic to ensure deterministic binary output
  result.classification = enforceStrictLabel(result.overallScore, result.classification);
  
  return result;
}
