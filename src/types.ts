export type Section = 'home' | 'detection' | 'workflow' | 'models' | 'history' | 'logs' | 'stats';

export interface AnalysisResult {
  overallScore: number; // 0 to 100 (AI percentage)
  segments: AnalysisSegment[];
  explanation: string;
  classification: 'AI-GENERATED' | 'HUMAN-WRITTEN' | 'UNCERTAIN' | 'AI-generated' | 'Human-written';
  metrics: {
    perplexity: number;
    burstiness: number;
    coherence: number;
  };
}

export interface AnalysisSegment {
  text: string;
  score: number; // 0 (Human) to 1 (AI)
  label: 'human' | 'ai';
  explanation: string;
}

export interface HistoryRecord {
  id: number;
  text: string;
  result_json: string;
  model_used: string;
  timestamp: string;
}

export interface SystemLog {
  id: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
}

export type ModelOption = 'roberta' | 'gpt' | 'gemini' | 'huggingface';

export interface ModelMetadata {
  id: ModelOption;
  name: string;
  provider: string;
  status: 'online' | 'offline' | 'degraded';
  latency: string;
  accuracy: string;
  description: string;
  cost: string;
  privacy: string;
  maxContext: string;
}

export interface ParallelAnalysisResult {
  finalResult: AnalysisResult;
  modelResults: {
    modelId: ModelOption;
    result: AnalysisResult;
    confidence: number;
  }[];
}

export interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  details?: string;
}
