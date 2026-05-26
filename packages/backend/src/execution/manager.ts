import { v4 as uuidv4 } from 'uuid';
import { ExecutionSession, ExecutionStatus, ExecutionLog, ExecutionRequest } from './types';
import { JavaScriptRuntime } from './runtimes/javascript';

const EXECUTION_TIMEOUT = parseInt(process.env.EXECUTION_TIMEOUT_MS || '30000');

export class ExecutionManager {
  private sessions: Map<string, ExecutionSession> = new Map();
  private runtime: JavaScriptRuntime;
  private activeExecutions: Map<string, AbortController> = new Map();

  constructor() {
    this.runtime = new JavaScriptRuntime();
  }

  async executeCode(request: ExecutionRequest): Promise<ExecutionSession> {
    const session = this.createSession(request.code);
    this.sessions.set(session.id, session);

    // Execute asynchronously
    this.runExecution(session).catch((err) => {
      session.status = 'failed';
      session.error = err.message || 'Unknown error';
      session.endTime = Date.now();
      session.executionTime = session.endTime - (session.startTime || session.endTime);
    });

    return session;
  }

  private createSession(code: string): ExecutionSession {
    return {
      id: uuidv4(),
      code,
      status: 'queued',
      logs: [],
      error: null,
      result: null,
      startTime: null,
      endTime: null,
      executionTime: null,
      createdAt: Date.now(),
    };
  }

  private async runExecution(session: ExecutionSession): Promise<void> {
    session.status = 'running';
    session.startTime = Date.now();

    const abortController = new AbortController();
    this.activeExecutions.set(session.id, abortController);

    const timeoutId = setTimeout(() => {
      abortController.abort();
      session.status = 'timed_out';
      session.error = `Execution timed out after ${EXECUTION_TIMEOUT}ms`;
      session.endTime = Date.now();
      session.executionTime = session.endTime - (session.startTime || session.endTime);
      this.activeExecutions.delete(session.id);
    }, EXECUTION_TIMEOUT);

    try {
      const result = await this.runtime.execute(session.code, (log: ExecutionLog) => {
        session.logs.push(log);
      });

      session.result = result;
      session.status = 'completed';
    } catch (error) {
      session.status = 'failed';
      session.error = error instanceof Error ? error.message : String(error);
      session.logs.push({
        type: 'error',
        message: session.error,
        timestamp: Date.now(),
      });
    } finally {
      clearTimeout(timeoutId);
      session.endTime = Date.now();
      session.executionTime = session.endTime - (session.startTime || session.endTime);
      this.activeExecutions.delete(session.id);
    }
  }

  getSession(id: string): ExecutionSession | undefined {
    return this.sessions.get(id);
  }

  getAllSessions(): ExecutionSession[] {
    return Array.from(this.sessions.values());
  }

  cancelExecution(id: string): boolean {
    const abortController = this.activeExecutions.get(id);
    if (abortController) {
      abortController.abort();
      const session = this.sessions.get(id);
      if (session) {
        session.status = 'failed';
        session.error = 'Execution cancelled by user';
        session.endTime = Date.now();
        session.executionTime = session.endTime - (session.startTime || session.endTime);
      }
      this.activeExecutions.delete(id);
      return true;
    }
    return false;
  }

  clearOldSessions(maxAge: number = 3600000): void {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (now - session.createdAt > maxAge && session.status !== 'running') {
        this.sessions.delete(id);
      }
    }
  }
}
