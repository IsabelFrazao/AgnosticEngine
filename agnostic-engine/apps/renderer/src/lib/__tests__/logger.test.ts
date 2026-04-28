import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LogEntry, LogTransport } from '@/src/lib/logger';
import { logger, setLoggerTransports } from '@/src/lib/logger';

type ReporterGlobal = typeof globalThis & {
  __AGNOSTIC_ENGINE_REPORTER__?: (entry: LogEntry) => void;
};

describe('logger transports', () => {
  beforeEach(() => {
    setLoggerTransports([]);
    (globalThis as ReporterGlobal).__AGNOSTIC_ENGINE_REPORTER__ = undefined;
  });

  it('dispatches log entries to configured transports', () => {
    const entries: LogEntry[] = [];
    const captureTransport: LogTransport = {
      log: (entry) => entries.push(entry),
    };

    setLoggerTransports([captureTransport]);
    logger.warn('Permission denied', { id: 'node-1' });

    expect(entries).toHaveLength(1);
    expect(entries[0]?.level).toBe('warn');
    expect(entries[0]?.message).toBe('Permission denied');
    expect(entries[0]?.source).toBe('agnostic-engine');
  });

  it('supports external reporter integration via global hook transport', () => {
    const reporterSpy = vi.fn();
    (globalThis as ReporterGlobal).__AGNOSTIC_ENGINE_REPORTER__ = reporterSpy;

    const reporterTransport: LogTransport = {
      log: (entry) => {
        (globalThis as ReporterGlobal).__AGNOSTIC_ENGINE_REPORTER__?.(entry);
      },
    };

    setLoggerTransports([reporterTransport]);
    logger.error('Render failed', { component: 'button' });

    expect(reporterSpy).toHaveBeenCalledTimes(1);
    expect(reporterSpy.mock.calls[0]?.[0]?.level).toBe('error');
  });
});
