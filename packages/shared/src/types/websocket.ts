export type WebSocketEventType =
  | 'execution:started'
  | 'execution:log'
  | 'execution:error'
  | 'execution:completed'
  | 'execution:timeout'
  | 'execution:status';

export interface WebSocketMessage<T = unknown> {
  type: WebSocketEventType;
  sessionId: string;
  timestamp: number;
  data: T;
}

export interface ExecutionStartedData {
  sessionId: string;
  code: string;
}

export interface ExecutionLogData {
  level: 'log' | 'error' | 'warn' | 'info';
  message: string;
}

export interface ExecutionErrorData {
  error: string;
  stack?: string;
}

export interface ExecutionCompletedData {
  executionTime: number;
  success: boolean;
}

export interface ExecutionStatusData {
  status: string;
  executionTime: number;
}
