import { parentPort } from 'worker_threads';

if (!parentPort) {
  throw new Error('Worker must be spawned from parent thread');
}

// Capture console methods
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args) => {
  parentPort.postMessage({
    type: 'log',
    data: args.map((arg) => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' '),
  });
};

console.error = (...args) => {
  parentPort.postMessage({
    type: 'error',
    error: args.map((arg) => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' '),
  });
};

console.warn = (...args) => {
  parentPort.postMessage({
    type: 'warn',
    data: args.map((arg) => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' '),
  });
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  parentPort.postMessage({
    type: 'uncaught',
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});

// Listen for code execution
parentPort.on('message', async (message) => {
  try {
    const { code } = message;

    // Create async function to support await
    const asyncCode = `(async () => { ${code} })()`;
    const result = await eval(asyncCode);

    parentPort.postMessage({
      type: 'result',
      data: result,
    });
  } catch (error) {
    parentPort.postMessage({
      type: 'uncaught',
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
});
