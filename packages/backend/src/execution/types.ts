export type ExecutionStatus = 'queued' | 'running' | 'completed' | 'failed' | 'timed_out';

export interface ExecutionLog {
  type: 'log' | 'error' | 'warn';
  message: string;
  timestamp: number;
}

export interface ExecutionSession {
  id: string;
  code: string;
  status: ExecutionStatus;
  logs: ExecutionLog[];
  error: string | null;
  result: string | null;
  startTime: number | null;
  endTime: number | null;
  executionTime: number | null;
  createdAt: number;
}

export interface ExecutionRequest {
  code: string;
}

export interface ExecutionResult {
  success: boolean;
  logs: ExecutionLog[];
  error: string | null;
  result: string | null;
  executionTime: number;
  code: string;
}

export interface WorkerMessage {
  type: 'start' | 'log' | 'error' | 'completed';
  timestamp: number;
  data?: {
    message?: string;
    logType?: 'log' | 'error' | 'warn';
    result?: string;
    executionTime?: number;
    error?: string;
  };
}
