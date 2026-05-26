/**
 * Execution request payload
 */
export interface ExecutionRequest {
  prompt: string;
  provider?: 'openai' | 'claude' | 'gemini';
  language?: string;
  timeout?: number;
}

/**
 * Execution response
 */
export interface ExecutionResponse {
  id: string;
  code: string;
  output: string;
  error?: string;
  status: 'success' | 'error' | 'timeout';
  duration: number;
  timestamp: number;
}

/**
 * WebSocket message types
 */
export interface WSMessage {
  type: 'execution_start' | 'execution_progress' | 'execution_complete' | 'error';
  data: Record<string, unknown>;
  id?: string;
}

/**
 * Execution progress event
 */
export interface ExecutionProgress {
  id: string;
  output: string;
  type: 'stdout' | 'stderr';
}

/**
 * AI Provider interface
 */
export interface AIProvider {
  name: string;
  generate(prompt: string): Promise<string>;
}

/**
 * Execution context
 */
export interface ExecutionContext {
  id: string;
  code: string;
  timeout: number;
  maxOutput: number;
}
