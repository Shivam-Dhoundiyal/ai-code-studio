const { parentPort } = require('worker_threads');

// Safely intercept console methods
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

const sendLog = (type, args) => {
  const message = args.map((arg) => {
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  }).join(' ');

  parentPort.postMessage({
    type: 'log',
    logType: type,
    message,
  });
};

console.log = (...args) => {
  sendLog('log', args);
};

console.error = (...args) => {
  sendLog('error', args);
};

console.warn = (...args) => {
  sendLog('warn', args);
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  parentPort.postMessage({
    type: 'error',
    error: error.message || String(error),
  });
  parentPort.postMessage({ type: 'completed' });
});

// Listen for execution requests
parentPort.on('message', (message) => {
  if (message.type === 'execute') {
    try {
      // Create a new Function to execute the code
      // This provides a fresh scope and prevents direct access to require/process
      const fn = new Function(message.code);
      const result = fn();

      // Log the result if it's not undefined
      if (result !== undefined) {
        console.log(result);
      }

      parentPort.postMessage({ type: 'completed' });
    } catch (error) {
      parentPort.postMessage({
        type: 'error',
        error: error instanceof Error ? error.message : String(error),
      });
      parentPort.postMessage({ type: 'completed' });
    }
  }
});
