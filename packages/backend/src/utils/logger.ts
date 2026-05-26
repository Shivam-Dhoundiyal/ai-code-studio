enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level = LogLevel.INFO;

  debug(message: string): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(`[DEBUG] ${message}`);
    }
  }

  info(message: string): void {
    if (this.level <= LogLevel.INFO) {
      console.log(`[INFO] ${message}`);
    }
  }

  warn(message: string): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`);
    }
  }

  error(message: string): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`);
    }
  }
}

export const logger = new Logger();
