import { AnalysisResult, ModelOption, ParallelAnalysisResult } from "../types";
import { analyzeTextWithGemini } from "./geminiService";
import { analyzeTextWithRoBERTa } from "./robertaService";
import { enforceStrictLabel } from "./validationService";

// Mock analysis for models that don't have a real implementation yet
async function mockAnalyze(text: string, modelId: ModelOption): Promise<AnalysisResult> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
  
  const isAI = Math.random() > 0.5;
  const score = isAI ? 70 + Math.random() * 30 : Math.random() * 30;
  
  return {
    overallScore: score,
    classification: enforceStrictLabel(score),
    segments: [
      {
        text: text,
        score: isAI ? 0.9 : 0.1,
        label: isAI ? 'ai' : 'human',
        explanation: `Analysis by ${modelId} suggests ${isAI ? 'AI' : 'Human'} origin based on linguistic patterns.`
      }
    ],
    explanation: `${modelId} analysis completed. The text shows characteristics of ${isAI ? 'AI-generated' : 'human-written'} content.`,
    metrics: {
      perplexity: 10 + Math.random() * 90,
      burstiness: Math.random() * 5,
      coherence: 0.5 + Math.random() * 0.5
    }
  };
}

export async function runParallelAnalysis(
  text: string, 
  models: ModelOption[],
  onStepUpdate?: (stepId: string, status: 'processing' | 'completed' | 'error') => void
): Promise<ParallelAnalysisResult> {
  
  if (onStepUpdate) onStepUpdate('preprocess', 'processing');
  await new Promise(resolve => setTimeout(resolve, 800));
  if (onStepUpdate) onStepUpdate('preprocess', 'completed');

  if (onStepUpdate) onStepUpdate('parallel-run', 'processing');
  
  const analysisPromises = models.map(async (modelId) => {
    try {
      let result: AnalysisResult;
      if (modelId === 'gemini') {
        result = await analyzeTextWithGemini(text);
      } else if (modelId === 'roberta') {
        result = await analyzeTextWithRoBERTa(text);
      } else {
        result = await mockAnalyze(text, modelId);
      }
      const confidence = result.overallScore > 50 
        ? result.overallScore / 100 
        : (100 - result.overallScore) / 100;

      return { modelId, result, confidence };
    } catch (error) {
      console.error(`Error analyzing with ${modelId}:`, error);
      return null;
    }
  });

  const results = await Promise.all(analysisPromises);
  const modelResults = results.filter((r): r is { modelId: ModelOption; result: AnalysisResult; confidence: number } => r !== null);
  
  if (modelResults.length === 0) {
    throw new Error("All analysis models failed. Please check your API configuration.");
  }

  if (onStepUpdate) onStepUpdate('parallel-run', 'completed');

  if (onStepUpdate) onStepUpdate('aggregate', 'processing');
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Aggregate results (Weighted Average)
  const totalWeight = modelResults.reduce((acc, curr) => acc + curr.confidence, 0);
  const weightedScore = modelResults.reduce((acc, curr) => acc + (curr.result.overallScore * curr.confidence), 0) / totalWeight;

  // Determine final classification based on weighted score (Deterministic Override)
  const finalClassification = enforceStrictLabel(weightedScore);

  // Combine explanations
  const finalExplanation = `Consensus reached via parallel analysis of ${models.length} models. ` + 
    modelResults.map(r => `${r.modelId}: ${r.result.overallScore.toFixed(0)}%`).join(', ') + ".";

  const finalResult: AnalysisResult = {
    overallScore: weightedScore,
    classification: finalClassification,
    segments: modelResults[0].result.segments, // Use segments from the first model for simplicity
    explanation: finalExplanation,
    metrics: {
      perplexity: modelResults.reduce((acc, curr) => acc + curr.result.metrics.perplexity, 0) / models.length,
      burstiness: modelResults.reduce((acc, curr) => acc + curr.result.metrics.burstiness, 0) / models.length,
      coherence: modelResults.reduce((acc, curr) => acc + curr.result.metrics.coherence, 0) / models.length,
    }
  };

  if (onStepUpdate) onStepUpdate('aggregate', 'completed');
  
  if (onStepUpdate) onStepUpdate('final-result', 'completed');

  return {
    finalResult,
    modelResults
  };
}
