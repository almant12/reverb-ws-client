export type LoggerOptions = {
  debug?: boolean;
};

export class Logger {
  constructor(private options: LoggerOptions = {}) {}

  log(...args: unknown[]) {
    if (!this.options.debug) return;
    console.log(...args);
  }

  warn(...args: unknown[]) {
    if (!this.options.debug) return;
    console.warn(...args);
  }

  error(...args: unknown[]) {
    if (!this.options.debug) return;
    console.error(...args);
  }

  
}
