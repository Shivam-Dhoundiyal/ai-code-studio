export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'timeout';

export interface ExecutionSession {
  id: string;
  code: string;
  prompt: string;
  status: ExecutionStatus;
  logs: LogEntry[];
  error: string | null;
  startTime: number | null;
  endTime: number | null;
  executionTime: number;
  result?: unknown;
}

export interface LogEntry {
  timestamp: number;
  level: 'log' | 'error' | 'warn' | 'info';
  message: string;
}

export interface ExecutionRequest {
  prompt: string;
  code?: string;
}

export interface ExecutionResult {
  success: boolean;
  sessionId: string;
  code: string;
  logs: LogEntry[];
  error: string | null;
  executionTime: number;
  status: ExecutionStatus;
}

export interface GenerateCodeRequest {
  prompt: string;
}

export interface GenerateCodeResponse {
  code: string;
  language: string;
}
