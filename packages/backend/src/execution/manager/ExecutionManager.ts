import { v4 as uuidv4 } from 'uuid';
import { ExecutionSession, ExecutionStatus, ExecutionLog, ExecutionRequest, ExecutionResult } from '../types';
import { JavaScriptRuntime } from '../runtimes/javascript';
import { logger } from '../../utils/logger';

const DEFAULT_TIMEOUT = 30000; // 30 seconds

export class ExecutionManager {
  private sessions = new Map<string, ExecutionSession>();
  private runtime = new JavaScriptRuntime();
  private listeners = new Map<string, Set<(session: ExecutionSession) => void>>();

  /**
   * Create and queue a new execution session
   */
  async createSession(code: string, prompt?: string): Promise<ExecutionSession> {
    const id = uuidv4();
    const session: ExecutionSession = {
      id,
      code,
      prompt,
      status: 'queued',
      logs: [],
      startTime: Date.now(),
    };

    this.sessions.set(id, session);
    this.notifyListeners(id, session);
    logger.info(`[ExecutionManager] Session created: ${id}`);

    return session;
  }

  /**
   * Execute code in isolated runtime
   */
  async execute(
    sessionId: string,
    request: ExecutionRequest
  ): Promise<ExecutionResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Update status to running
    session.status = 'running';
    session.startTime = Date.now();
    this.notifyListeners(sessionId, session);

    try {
      const timeout = request.timeout || DEFAULT_TIMEOUT;
      const result = await this.runtime.execute(request.code, timeout, (log) => {
        session.logs.push(log);
        this.notifyListeners(sessionId, session);
      });

      const executionTime = Date.now() - session.startTime;
      session.status = 'completed';
      session.endTime = Date.now();
      session.executionTime = executionTime;
      session.result = result;

      this.notifyListeners(sessionId, session);

      return {
        success: true,
        logs: session.logs,
        error: null,
        executionTime,
        code: request.code,
      };
    } catch (error) {
      const executionTime = Date.now() - session.startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      session.status = errorMessage.includes('timeout') ? 'timed_out' : 'failed';
      session.error = errorMessage;
      session.endTime = Date.now();
      session.executionTime = executionTime;

      this.notifyListeners(sessionId, session);

      return {
        success: false,
        logs: session.logs,
        error: errorMessage,
        executionTime,
        code: request.code,
      };
    }
  }

  /**
   * Get execution session by ID
   */
  getSession(id: string): ExecutionSession | undefined {
    return this.sessions.get(id);
  }

  /**
   * Get all execution sessions
   */
  getAllSessions(): ExecutionSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Subscribe to session updates
   */
  subscribe(
    sessionId: string,
    callback: (session: ExecutionSession) => void
  ): () => void {
    if (!this.listeners.has(sessionId)) {
      this.listeners.set(sessionId, new Set());
    }

    this.listeners.get(sessionId)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(sessionId)?.delete(callback);
    };
  }

  /**
   * Notify all listeners of session update
   */
  private notifyListeners(sessionId: string, session: ExecutionSession): void {
    const sessionListeners = this.listeners.get(sessionId);
    if (sessionListeners) {
      sessionListeners.forEach((callback) => callback(session));
    }
  }

  /**
   * Cleanup old sessions (optional)
   */
  cleanup(maxAge = 3600000): void {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.startTime > maxAge) {
        this.sessions.delete(id);
        this.listeners.delete(id);
      }
    }
  }
}

// Singleton instance
export const executionManager = new ExecutionManager();
