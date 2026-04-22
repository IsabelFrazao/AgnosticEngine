export interface AppLogger {
  info(message: string, context?: unknown): void;
  error(message: string, context?: unknown): void;
  warn(message: string, context?: unknown): void;
}

const consoleLogger: AppLogger = {
  info: (msg, ctx) => console.info(`[AgnosticEngine] ${msg}`, ctx ?? ''),
  error: (msg, ctx) => console.error(`[AgnosticEngine] ${msg}`, ctx ?? ''),
  warn: (msg, ctx) => console.warn(`[AgnosticEngine] ${msg}`, ctx ?? ''),
};

// Swap this export for a Sentry-backed implementation when ready.
export const logger: AppLogger = consoleLogger;
