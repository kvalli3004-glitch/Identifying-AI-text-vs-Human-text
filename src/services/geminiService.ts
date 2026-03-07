import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeTextWithGemini(text: string): Promise<AnalysisResult> {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: `You are an AI text analysis system designed to detect whether a piece of text is AI-generated or Human-written.

Analyze the given text carefully and follow the workflow steps below.

TASK:
Determine if the text is AI-generated or Human-written and explain the reasoning.

INPUT TEXT:
${text}

ANALYSIS INSTRUCTIONS:

1. Writing Pattern Analysis
Examine the text for patterns commonly found in AI-generated content:
- Highly uniform sentence structures
- Predictable word choices
- Lack of natural variation
- Repetitive phrasing

Also check for human writing characteristics:
- Variation in sentence length
- Imperfect grammar or stylistic diversity
- Personal tone or contextual reasoning

2. Context Awareness
Determine whether the text resembles:
- Academic or textbook writing
- Blog/article writing
- Conversational writing
- AI-generated structured responses

IMPORTANT:
Do not classify text as AI-generated only because it is formal or well structured. Many older textbooks and academic materials are written in structured language by humans.

3. Sentence-Level Evaluation
Evaluate each sentence individually and estimate the probability that the sentence is AI-generated.

4. Highlight Suspicious Sections
Mark sentences that appear AI-generated.

5. Probability Estimation
Estimate probabilities for the entire text.

6. Explanation
Explain briefly why the text is predicted as AI or Human.
Mention the writing patterns detected.

7. Final Classification
Return one of the following: AI-GENERATED, HUMAN-WRITTEN, or UNCERTAIN.

Return the result in JSON format matching the schema provided.` }]
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
            enum: ["AI-GENERATED", "HUMAN-WRITTEN", "UNCERTAIN"],
            description: "Final classification based on the analysis"
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

  return JSON.parse(response.text || "{}");
}
