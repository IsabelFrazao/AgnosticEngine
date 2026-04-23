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

function createRemoteTransportFromEnv(): LogTransport | null {
  if (typeof window !== 'undefined') return null;

  const ingestUrl = process.env.AE_LOG_INGEST_URL;
  if (!ingestUrl) return null;
  const ingestToken = process.env.AE_LOG_INGEST_TOKEN;

  return {
    log: (entry) => {
      // Intentional convention break: observability sinks can target third-party
      // endpoints, so this transport cannot use the app's API client base URL.
      void fetch(ingestUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(ingestToken ? { authorization: `Bearer ${ingestToken}` } : {}),
        },
        body: JSON.stringify(entry),
      }).catch((remoteError) => {
        console.error('[AgnosticEngine][ERROR] Remote log transport failed', remoteError);
      });
    },
  };
}

function getDefaultTransports(): readonly LogTransport[] {
  const remoteTransport = createRemoteTransportFromEnv();
  return remoteTransport
    ? [consoleTransport, reporterTransport, remoteTransport]
    : [consoleTransport, reporterTransport];
}

let activeTransports: readonly LogTransport[] = getDefaultTransports();

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
