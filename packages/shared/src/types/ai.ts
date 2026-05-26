export type AIProviderType = 'openai' | 'claude' | 'gemini' | 'openrouter';

export interface AIProviderConfig {
  type: AIProviderType;
  apiKey: string;
}

export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}
