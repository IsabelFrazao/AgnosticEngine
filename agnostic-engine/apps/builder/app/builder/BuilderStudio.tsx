'use client';

import { useMemo, useState } from 'react';

type DraftSiteVersion = {
  siteSlug: string;
  schemaVersion: string;
  layout: unknown;
  pages: Record<string, unknown>;
  updatedAt: string;
};

type BuilderStudioProps = {
  initialDraft: DraftSiteVersion;
};

type EditorState = {
  layoutText: string;
  pagesText: string;
};

function toEditorState(draft: DraftSiteVersion): EditorState {
  return {
    layoutText: JSON.stringify(draft.layout, null, 2),
    pagesText: JSON.stringify(draft.pages, null, 2),
  };
}

function parseJsonObject(raw: string): Record<string, unknown> {
  const parsed = JSON.parse(raw) as unknown;
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Expected JSON object');
  }
  return parsed as Record<string, unknown>;
}

function validateDraft(layoutText: string, pagesText: string): string[] {
  const issues: string[] = [];

  try {
    const layout = parseJsonObject(layoutText);
    if (!('schemaVersion' in layout)) {
      issues.push('Layout is missing schemaVersion.');
    }
  } catch {
    issues.push('Layout JSON is invalid.');
  }

  try {
    const pages = parseJsonObject(pagesText);
    if (!pages['/']) {
      issues.push('Pages JSON must include "/" root page.');
    }
  } catch {
    issues.push('Pages JSON is invalid.');
  }

  return issues;
}

function nextHistory(
  history: EditorState[],
  nextState: EditorState,
  pointer: number,
): { history: EditorState[]; pointer: number } {
  const trimmed = history.slice(0, pointer + 1);
  return {
    history: [...trimmed, nextState],
    pointer: trimmed.length,
  };
}

function reorderKeys(
  source: Record<string, unknown>,
  fromKey: string,
  toKey: string,
): Record<string, unknown> {
  if (fromKey === toKey) return source;
  const entries = Object.entries(source);
  const fromIndex = entries.findIndex(([key]) => key === fromKey);
  const toIndex = entries.findIndex(([key]) => key === toKey);
  if (fromIndex < 0 || toIndex < 0) return source;

  const [moved] = entries.splice(fromIndex, 1);
  entries.splice(toIndex, 0, moved);
  return Object.fromEntries(entries);
}

export function BuilderStudio({ initialDraft }: BuilderStudioProps) {
  const initialState = useMemo(() => toEditorState(initialDraft), [initialDraft]);
  const [history, setHistory] = useState<EditorState[]>([initialState]);
  const [pointer, setPointer] = useState(0);
  const [status, setStatus] = useState<string>('Idle');
  const [issues, setIssues] = useState<string[]>([]);
  const [draggingPage, setDraggingPage] = useState<string | null>(null);

  const current = history[pointer];
  const pageKeys = useMemo(() => {
    try {
      return Object.keys(parseJsonObject(current.pagesText));
    } catch {
      return [];
    }
  }, [current.pagesText]);

  function commit(nextState: EditorState) {
    const next = nextHistory(history, nextState, pointer);
    setHistory(next.history);
    setPointer(next.pointer);
  }

  function onLayoutChange(value: string) {
    commit({ ...current, layoutText: value });
  }

  function onPagesChange(value: string) {
    commit({ ...current, pagesText: value });
  }

  function onUndo() {
    if (pointer <= 0) return;
    setPointer(pointer - 1);
  }

  function onRedo() {
    if (pointer >= history.length - 1) return;
    setPointer(pointer + 1);
  }

  function addPaletteItem(type: 'button' | 'table' | 'theme-switcher') {
    try {
      const pages = parseJsonObject(current.pagesText);
      const home = pages['/'] as Record<string, unknown> | undefined;
      if (!home || typeof home !== 'object') {
        setStatus('Cannot add component: "/" page missing');
        return;
      }
      const components = Array.isArray(home.components) ? [...home.components] : [];
      components.push({
        id: `builder-${type}-${Date.now()}`,
        type,
        props: {
          metadata:
            type === 'button'
              ? { labelKey: 'Builder Added Button', variant: 'secondary', actionId: 'demo:log' }
              : type === 'table'
                ? { columns: ['Col'], rows: [{ Col: 'New row' }] }
                : { groupLabel: 'Builder Added Theme Switcher' },
        },
      });
      const nextPages = {
        ...pages,
        '/': {
          ...home,
          components,
        },
      };
      commit({
        ...current,
        pagesText: JSON.stringify(nextPages, null, 2),
      });
      setStatus(`Added ${type} to "/" page.`);
    } catch {
      setStatus('Cannot add component: pages JSON invalid.');
    }
  }

  function onPageDrop(targetKey: string) {
    if (!draggingPage) return;
    try {
      const pages = parseJsonObject(current.pagesText);
      const reordered = reorderKeys(pages, draggingPage, targetKey);
      commit({
        ...current,
        pagesText: JSON.stringify(reordered, null, 2),
      });
      setStatus(`Moved ${draggingPage} near ${targetKey}.`);
    } catch {
      setStatus('Cannot reorder pages: pages JSON invalid.');
    } finally {
      setDraggingPage(null);
    }
  }

  async function onSaveDraft() {
    const validationIssues = validateDraft(current.layoutText, current.pagesText);
    setIssues(validationIssues);
    if (validationIssues.length > 0) {
      setStatus('Fix validation issues before saving.');
      return;
    }

    try {
      setStatus('Saving draft...');
      const response = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          siteSlug: initialDraft.siteSlug,
          schemaVersion: initialDraft.schemaVersion,
          layout: JSON.parse(current.layoutText),
          pages: JSON.parse(current.pagesText),
        }),
      });
      if (!response.ok) {
        setStatus('Save failed.');
        return;
      }
      setStatus('Draft saved.');
    } catch {
      setStatus('Save failed due to network/runtime error.');
    }
  }

  async function onPublish() {
    const validationIssues = validateDraft(current.layoutText, current.pagesText);
    setIssues(validationIssues);
    if (validationIssues.length > 0) {
      setStatus('Fix validation issues before publishing.');
      return;
    }

    try {
      setStatus('Publishing...');
      const saveResponse = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          siteSlug: initialDraft.siteSlug,
          schemaVersion: initialDraft.schemaVersion,
          layout: JSON.parse(current.layoutText),
          pages: JSON.parse(current.pagesText),
        }),
      });
      if (!saveResponse.ok) {
        setStatus('Publish failed at save step.');
        return;
      }

      const publishResponse = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ siteSlug: initialDraft.siteSlug }),
      });
      if (!publishResponse.ok) {
        setStatus('Publish failed.');
        return;
      }
      setStatus('Published. Refresh renderer to see latest snapshot.');
    } catch {
      setStatus('Publish failed due to network/runtime error.');
    }
  }

  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn" type="button" onClick={onUndo} disabled={pointer <= 0}>Undo</button>
          <button className="btn" type="button" onClick={onRedo} disabled={pointer >= history.length - 1}>Redo</button>
          <button className="btn" type="button" onClick={onSaveDraft}>Save Draft</button>
          <button className="btn" type="button" onClick={onPublish}>Publish</button>
          <span className="muted">{status}</span>
        </div>
        {issues.length > 0 && (
          <ul style={{ marginTop: 10, color: '#fecaca' }}>
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 280px', gap: 16 }}>
        <aside className="card">
          <h3 style={{ marginTop: 0 }}>Component Palette</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            <button className="btn" type="button" onClick={() => addPaletteItem('button')}>Add Button</button>
            <button className="btn" type="button" onClick={() => addPaletteItem('table')}>Add Table</button>
            <button className="btn" type="button" onClick={() => addPaletteItem('theme-switcher')}>Add Theme Switcher</button>
          </div>
        </aside>

        <section className="card">
          <h3 style={{ marginTop: 0 }}>Canvas</h3>
          <p className="muted">M6: drag/drop page order, undo/redo history, validation feedback, publish workflow.</p>
          <label htmlFor="layout">Layout JSON</label>
          <textarea
            id="layout"
            className="textarea"
            value={current.layoutText}
            onChange={(event) => onLayoutChange(event.target.value)}
          />
          <div style={{ height: 12 }} />
          <label htmlFor="pages">Pages JSON</label>
          <textarea
            id="pages"
            className="textarea"
            value={current.pagesText}
            onChange={(event) => onPagesChange(event.target.value)}
          />
        </section>

        <aside className="card">
          <h3 style={{ marginTop: 0 }}>Inspector</h3>
          <p className="muted">Drag pages to reorder manifest order:</p>
          <ul style={{ display: 'grid', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
            {pageKeys.map((key) => (
              <li
                key={key}
                draggable
                onDragStart={() => setDraggingPage(key)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => onPageDrop(key)}
                className="card"
                style={{ padding: 8, cursor: 'move' }}
              >
                <code>{key}</code>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
