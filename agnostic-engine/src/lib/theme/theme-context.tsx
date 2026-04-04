'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { DEFAULT_THEME_ID, THEME_IDS } from './themes';
import type { ThemeId } from './theme-types';

// ── Context ───────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ── Storage ───────────────────────────────────────────────────────────────────

export const STORAGE_KEY = 'agnostic-theme';

function readStoredTheme(): ThemeId {
  if (typeof window === 'undefined') return DEFAULT_THEME_ID;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && THEME_IDS.has(stored as ThemeId)) return stored as ThemeId;
  } catch {
    // localStorage unavailable (e.g. strict private browsing)
  }
  return DEFAULT_THEME_ID;
}

function writeStoredTheme(id: ThemeId): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Silently ignore write failures
  }
}

// ── DOM ───────────────────────────────────────────────────────────────────────

function applyTheme(id: ThemeId): void {
  const root = document.documentElement;
  if (id === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', id);
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Lazy initializer: runs once, SSR-safe (returns default on server)
  const [theme, setThemeState] = useState<ThemeId>(readStoredTheme);

  useEffect(() => {
    applyTheme(theme);
    writeStoredTheme(theme);
  }, [theme]);

  function setTheme(id: ThemeId): void {
    if (!THEME_IDS.has(id)) return;
    setThemeState(id);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ── Internal hook (consumed via src/hooks/useTheme.ts) ────────────────────────

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used inside <ThemeProvider>');
  return ctx;
}
