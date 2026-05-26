import { Worker } from 'worker_threads';
import { ExecutionLog } from '../types';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class JavaScriptRuntime {
  private workerPath = path.join(__dirname, '../workers/javascript-worker.js');

  async execute(
    code: string,
    onLog: (log: ExecutionLog) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(this.workerPath);
      let output = '';
      let hasError = false;
      let errorMessage = '';

      const timeout = setTimeout(() => {
        worker.terminate();
        reject(new Error('Worker execution timeout'));
      }, 30000);

      worker.on('message', (message) => {
        if (message.type === 'log') {
          onLog({
            type: message.logType || 'log',
            message: message.message,
            timestamp: Date.now(),
          });
          output += message.message + '\n';
        } else if (message.type === 'error') {
          hasError = true;
          errorMessage = message.error;
          onLog({
            type: 'error',
            message: message.error,
            timestamp: Date.now(),
          });
        } else if (message.type === 'completed') {
          clearTimeout(timeout);
          worker.terminate();
          if (hasError) {
            reject(new Error(errorMessage));
          } else {
            resolve(output.trim());
          }
        }
      });

      worker.on('error', (error) => {
        clearTimeout(timeout);
        worker.terminate();
        reject(error);
      });

      worker.on('exit', (code) => {
        if (code !== 0 && !hasError) {
          clearTimeout(timeout);
          reject(new Error(`Worker exited with code ${code}`));
        }
      });

      worker.postMessage({ type: 'execute', code });
    });
  }
}
