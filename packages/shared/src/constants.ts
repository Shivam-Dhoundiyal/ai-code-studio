/**
 * Default configuration constants
 */

export const DEFAULT_EXECUTION_TIMEOUT = 5000; // 5 seconds
export const MAX_OUTPUT_SIZE = 100000; // 100KB
export const DEFAULT_LANGUAGE = 'javascript';

export const EXECUTION_TIMEOUT_ERROR = 'Execution timeout exceeded';
export const EXECUTION_OUTPUT_OVERFLOW = 'Output size exceeded maximum';

export const WS_MESSAGE_TYPES = {
  EXECUTION_START: 'execution_start',
  EXECUTION_PROGRESS: 'execution_progress',
  EXECUTION_COMPLETE: 'execution_complete',
  ERROR: 'error',
} as const;
