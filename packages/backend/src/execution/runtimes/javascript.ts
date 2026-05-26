import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';
import { ExecutionLog } from '../types';
import { logger } from '../../utils/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface WorkerMessage {
  type: 'log' | 'error' | 'warn' | 'result' | 'uncaught';
  data?: unknown;
  error?: string;
}

export class JavaScriptRuntime {
  /**
   * Execute JavaScript code in isolated worker thread
   */
  async execute(
    code: string,
    timeout: number,
    onLog: (log: ExecutionLog) => void
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const workerPath = path.join(__dirname, '../workers/javascript.worker.js');

      // Create worker thread
      const worker = new Worker(workerPath);
      let completed = false;
      let result: unknown;

      // Timeout handler
      const timeoutHandle = setTimeout(() => {
        if (!completed) {
          completed = true;
          worker.terminate();
          reject(new Error(`Execution timed out after ${timeout}ms`));
        }
      }, timeout);

      // Message handler
      worker.on('message', (message: WorkerMessage) => {
        if (message.type === 'log') {
          onLog({
            type: 'log',
            message: String(message.data),
            timestamp: Date.now(),
          });
        } else if (message.type === 'error') {
          onLog({
            type: 'error',
            message: String(message.error),
            timestamp: Date.now(),
          });
        } else if (message.type === 'warn') {
          onLog({
            type: 'warn',
            message: String(message.data),
            timestamp: Date.now(),
          });
        } else if (message.type === 'result') {
          if (!completed) {
            completed = true;
            clearTimeout(timeoutHandle);
            result = message.data;
            worker.terminate();
            resolve(result);
          }
        } else if (message.type === 'uncaught') {
          if (!completed) {
            completed = true;
            clearTimeout(timeoutHandle);
            worker.terminate();
            reject(new Error(message.error));
          }
        }
      });

      // Error handler
      worker.on('error', (error) => {
        if (!completed) {
          completed = true;
          clearTimeout(timeoutHandle);
          reject(new Error(`Worker error: ${error.message}`));
        }
      });

      // Exit handler
      worker.on('exit', (code) => {
        if (!completed) {
          completed = true;
          clearTimeout(timeoutHandle);
          if (code !== 0) {
            reject(new Error(`Worker exited with code ${code}`));
          }
        }
      });

      // Send code to worker
      worker.postMessage({ code });
    });
  }
}
