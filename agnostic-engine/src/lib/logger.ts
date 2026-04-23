export type LogLevel = 'info' | 'warn' | 'error';

export type LogEntry = {
  level: LogLevel;
  message: string;
  context?: unknown;
  timestamp: string;
  source: 'agnostic-engine';
};

export interface AppLogger {
  info(message: string, context?: unknown): void;
  error(message: string, context?: unknown): void;
  warn(message: string, context?: unknown): void;
}

export interface LogTransport {
  log(entry: LogEntry): void;
}

type ReporterGlobal = {
  __AGNOSTIC_ENGINE_REPORTER__?: (entry: LogEntry) => void;
};

const consoleTransport: LogTransport = {
  log: (entry) => {
    const prefix = `[AgnosticEngine][${entry.level.toUpperCase()}]`;
    if (entry.level === 'error') {
      console.error(prefix, entry.message, entry.context ?? '');
      return;
    }
    if (entry.level === 'warn') {
      console.warn(prefix, entry.message, entry.context ?? '');
      return;
    }
    console.info(prefix, entry.message, entry.context ?? '');
  },
};

const reporterTransport: LogTransport = {
  log: (entry) => {
    const reporter = (globalThis as ReporterGlobal).__AGNOSTIC_ENGINE_REPORTER__;
    if (!reporter) return;
    try {
      reporter(entry);
    } catch (reporterError) {
      console.error('[AgnosticEngine][ERROR] External reporter failed', reporterError);
    }
  },
};

let activeTransports: readonly LogTransport[] = [consoleTransport, reporterTransport];

function dispatchLog(level: LogLevel, message: string, context?: unknown): void {
  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
    source: 'agnostic-engine',
  };

  for (const transport of activeTransports) {
    transport.log(entry);
  }
}

/**
 * Allows production bootstrap code to replace transports with Sentry/Datadog/etc.
 * Keeping this in one place preserves stable logger call sites across the app.
 */
export function setLoggerTransports(transports: readonly LogTransport[]): void {
  activeTransports = transports.length > 0 ? transports : [consoleTransport];
}

export const logger: AppLogger = {
  info: (message, context) => dispatchLog('info', message, context),
  warn: (message, context) => dispatchLog('warn', message, context),
  error: (message, context) => dispatchLog('error', message, context),
};
