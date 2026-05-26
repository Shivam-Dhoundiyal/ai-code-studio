export type ExecutionStatus = 'queued' | 'running' | 'completed' | 'failed' | 'timed_out';

export interface ExecutionLog {
  type: 'log' | 'error' | 'warn';
  message: string;
  timestamp: number;
}

export interface ExecutionSession {
  id: string;
  code: string;
  prompt?: string;
  status: ExecutionStatus;
  logs: ExecutionLog[];
  error?: string;
  result?: unknown;
  startTime: number;
  endTime?: number;
  executionTime?: number;
}

export interface ExecutionRequest {
  code: string;
  timeout?: number;
}

export interface ExecutionResult {
  success: boolean;
  logs: ExecutionLog[];
  error: string | null;
  executionTime: number;
  code: string;
}
