export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const currentLevel = LogLevel[process.env.LOG_LEVEL as keyof typeof LogLevel] ?? LogLevel.INFO;

const log = (level: LogLevel, message: string, data?: unknown) => {
  if (level < currentLevel) return;

  const timestamp = new Date().toISOString();
  const levelName = LogLevel[level];

  if (data) {
    console.log(`[${timestamp}] ${levelName}: ${message}`, data);
  } else {
    console.log(`[${timestamp}] ${levelName}: ${message}`);
  }
};

export const logger = {
  debug: (message: string, data?: unknown) => log(LogLevel.DEBUG, message, data),
  info: (message: string, data?: unknown) => log(LogLevel.INFO, message, data),
  warn: (message: string, data?: unknown) => log(LogLevel.WARN, message, data),
  error: (message: string, data?: unknown) => log(LogLevel.ERROR, message, data),
};
