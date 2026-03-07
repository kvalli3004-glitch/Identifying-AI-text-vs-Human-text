import { ModelMetadata } from './types';

export const MODELS: ModelMetadata[] = [
  {
    id: 'roberta',
    name: 'RoBERTa-Base',
    provider: 'Local (PyTorch)',
    status: 'online',
    latency: '12ms',
    accuracy: '94.2%',
    description: 'Optimized for fast, local inference. Best for short to medium length texts.',
    cost: 'Free (Local)',
    privacy: 'Maximum (Local)',
    maxContext: '512 tokens'
  },
  {
    id: 'gemini',
    name: 'Gemini 2.0 Flash',
    provider: 'Google Cloud',
    status: 'online',
    latency: '450ms',
    accuracy: '98.5%',
    description: 'High-performance multimodal model. Excellent at detecting complex AI patterns.',
    cost: '$0.001 / 1k tokens',
    privacy: 'Standard (Cloud)',
    maxContext: '1,000,000+ tokens'
  },
  {
    id: 'gpt',
    name: 'GPT-4o',
    provider: 'OpenAI',
    status: 'online',
    latency: '820ms',
    accuracy: '95.1%',
    description: 'Industry standard for text analysis. Superior reasoning and context awareness.',
    cost: '$0.015 / 1k tokens',
    privacy: 'Standard (Cloud)',
    maxContext: '128,000 tokens'
  },
  {
    id: 'huggingface',
    name: 'DistilBERT AI',
    provider: 'Hugging Face',
    status: 'degraded',
    latency: '1.2s',
    accuracy: '91.8%',
    description: 'Community-driven model. Currently experiencing higher than normal latency.',
    cost: 'Free Tier',
    privacy: 'Shared (Public)',
    maxContext: '2,048 tokens'
  }
];
