'use client';

import { useMemo, useRef, useState, type DragEvent } from 'react';
import {
  COMPONENT_CATALOG,
  type ComponentType,
  type InspectorFieldConfig,
} from '@agnostic/component-catalog';
import { Button, Table, ThemeProvider, ThemeSwitcher } from '@agnostic/ui-kit';
import {
  createNewPage,
  createPaletteItem,
  moveInArray,
  type BuilderItem,
  type BuilderPage,
  type BuilderSection,
  type BuilderState,
  type DraftSiteVersion,
  validateBuilderState,
} from '@/src/lib/builder-state';
import {
  projectBuilderStateToDraftPayload,
  projectDraftToBuilderState,
} from '@/src/lib/schema-projection';

type BuilderStudioProps = {
  initialDraft: DraftSiteVersion;
};

function nextHistory(
  history: BuilderState[],
  nextState: BuilderState,
  pointer: number,
): { history: BuilderState[]; pointer: number } {
  const trimmed = history.slice(0, pointer + 1);
  return {
    history: [...trimmed, nextState],
    pointer: trimmed.length,
  };
}

function sanitizeSlugInput(raw: string): string {
  const normalized = raw.trim().toLowerCase();
  if (!normalized || normalized === '/') return '/';
  const cleaned = normalized
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9/_-]/g, '')
    .replace(/\/{2,}/g, '/');
  if (!cleaned) return '/';
  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
}

function toJsonText(state: BuilderState): { layoutText: string; pagesText: string } {
  const payload = projectBuilderStateToDraftPayload(state);
  return {
    layoutText: JSON.stringify(payload.layout, null, 2),
    pagesText: JSON.stringify(payload.pages, null, 2),
  };
}

function parseMetadataJson(value: string): unknown | null {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function updateFieldValue(
  metadata: Record<string, unknown>,
  field: InspectorFieldConfig,
  value: string | boolean,
): Record<string, unknown> {
  const next = { ...metadata };
  if (field.kind === 'boolean') {
    next[field.key] = Boolean(value);
    return next;
  }
  const stringValue = String(value);
  if (field.kind === 'number') {
    const asNumber = Number(stringValue);
    next[field.key] = Number.isFinite(asNumber) ? asNumber : 0;
    return next;
  }
  if (field.kind === 'array' || field.kind === 'object') {
    const parsed = parseMetadataJson(stringValue);
    if (parsed === null) return next;
    if (field.kind === 'array' && Array.isArray(parsed)) {
      next[field.key] = parsed;
      return next;
    }
    if (field.kind === 'object' && parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      next[field.key] = parsed;
      return next;
    }
    return next;
  }
  next[field.key] = stringValue;
  return next;
}

function renderSimulatorItem(item: BuilderItem) {
  if (item.type === 'button') {
    return (
      <Button
        label={String(item.metadata.labelKey ?? 'Button')}
        variant={
          item.metadata.variant === 'primary' || item.metadata.variant === 'outline'
            ? item.metadata.variant
            : 'secondary'
        }
        isDisabled={Boolean(item.metadata.isDisabled)}
      />
    );
  }
  if (item.type === 'theme-switcher') {
    return (
      <ThemeSwitcher
        groupLabel={typeof item.metadata.groupLabel === 'string' ? item.metadata.groupLabel : 'Theme'}
        visibleThemes={Array.isArray(item.metadata.visibleThemes) ? (item.metadata.visibleThemes as never[]) : undefined}
      />
    );
  }
  const columns = Array.isArray(item.metadata.columns) ? item.metadata.columns.map(String) : ['Col'];
  const rows = Array.isArray(item.metadata.rows) ? item.metadata.rows : [{ Col: 'Row' }];
  return (
    <Table
      columns={columns}
      rows={rows as Array<Record<string, unknown>>}
      caption={typeof item.metadata.caption === 'string' ? item.metadata.caption : undefined}
    />
  );
}

export function BuilderStudio({ initialDraft }: BuilderStudioProps) {
  const initialState = useMemo(() => projectDraftToBuilderState(initialDraft), [initialDraft]);
  const [history, setHistory] = useState<BuilderState[]>([initialState]);
  const [pointer, setPointer] = useState(0);
  const [activePageSlug, setActivePageSlug] = useState(initialState.pages[0]?.slug ?? '/');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(initialState.pages[0]?.sections[0]?.id ?? null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [status, setStatus] = useState<string>('Idle');
  const [issues, setIssues] = useState<string[]>([]);
  const [draggingPageSlug, setDraggingPageSlug] = useState<string | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [draggingPaletteType, setDraggingPaletteType] = useState<ComponentType | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const idCounterRef = useRef(1);

  const current = history[pointer];
  const activePage = useMemo(
    () => current.pages.find((page) => page.slug === activePageSlug) ?? current.pages[0],
    [activePageSlug, current.pages],
  );
  const activeSection = useMemo(
    () => activePage?.sections.find((section) => section.id === selectedSectionId) ?? activePage?.sections[0],
    [activePage, selectedSectionId],
  );
  const selectedItem = useMemo(
    () => activeSection?.items.find((item) => item.id === selectedItemId) ?? null,
    [activeSection, selectedItemId],
  );
  const selectedItemCatalog = selectedItem
    ? COMPONENT_CATALOG.find((entry) => entry.type === selectedItem.type)
    : null;
  const json = useMemo(() => toJsonText(current), [current]);

  function commit(nextState: BuilderState) {
    const next = nextHistory(history, nextState, pointer);
    setHistory(next.history);
    setPointer(next.pointer);
  }

  function updateState(mutator: (state: BuilderState) => BuilderState) {
    commit(mutator(current));
  }

  function nextItemId(type: ComponentType): string {
    const id = idCounterRef.current;
    idCounterRef.current += 1;
    return `builder-${type}-${id}`;
  }

  function onPageDrop(targetSlug: string) {
    if (!draggingPageSlug) return;
    updateState((state) => {
      const fromIndex = state.pages.findIndex((page) => page.slug === draggingPageSlug);
      const toIndex = state.pages.findIndex((page) => page.slug === targetSlug);
      if (fromIndex < 0 || toIndex < 0) return state;
      return {
        ...state,
        pages: moveInArray(state.pages, fromIndex, toIndex).map((page, index) => ({
          ...page,
          navOrder: index,
        })),
      };
    });
    setDraggingPageSlug(null);
  }

  function addPage() {
    const input = window.prompt('New page slug (example: /pricing)', '/new-page');
    if (!input) return;
    const slug = sanitizeSlugInput(input);
    if (current.pages.some((page) => page.slug === slug)) {
      setStatus(`Page ${slug} already exists.`);
      return;
    }
    updateState((state) => {
      const page = createNewPage(slug, state.pages.length);
      return { ...state, pages: [...state.pages, page] };
    });
    setActivePageSlug(slug);
    setSelectedSectionId('section-main');
    setSelectedItemId(null);
  }

  function renamePage(slug: string) {
    const page = current.pages.find((entry) => entry.slug === slug);
    if (!page) return;
    const nextSlug = sanitizeSlugInput(window.prompt('Rename page slug', page.slug) ?? page.slug);
    if (nextSlug !== slug && current.pages.some((entry) => entry.slug === nextSlug)) {
      setStatus(`Page ${nextSlug} already exists.`);
      return;
    }
    updateState((state) => ({
      ...state,
      pages: state.pages.map((entry) =>
        entry.slug === slug
          ? {
              ...entry,
              slug: nextSlug,
              title: nextSlug === '/' ? 'Home' : entry.title,
              navLabel: nextSlug === '/' ? 'Home' : entry.navLabel,
            }
          : entry,
      ),
    }));
    setActivePageSlug(nextSlug);
  }

  function deletePage(slug: string) {
    if (slug === '/') {
      setStatus('Root page "/" cannot be deleted.');
      return;
    }
    updateState((state) => ({
      ...state,
      pages: state.pages.filter((entry) => entry.slug !== slug).map((page, index) => ({ ...page, navOrder: index })),
    }));
    setActivePageSlug('/');
    setSelectedSectionId('section-main');
    setSelectedItemId(null);
  }

  function addSection() {
    if (!activePage) return;
    const sectionId = `section-${Date.now()}`;
    updateState((state) => ({
      ...state,
      pages: state.pages.map((page) =>
        page.slug === activePage.slug
          ? {
              ...page,
              sections: [
                ...page.sections,
                { id: sectionId, title: `Section ${page.sections.length + 1}`, mode: 'free', items: [] },
              ],
            }
          : page,
      ),
    }));
    setSelectedSectionId(sectionId);
    setSelectedItemId(null);
  }

  function addPaletteItem(type: ComponentType) {
    if (!activePage) return;
    const sectionId = activeSection?.id ?? activePage.sections[0]?.id;
    if (!sectionId) return;
    const paletteItem = createPaletteItem(type);
    paletteItem.id = nextItemId(type);
    updateState((state) => ({
      ...state,
      pages: state.pages.map((page) =>
        page.slug === activePage.slug
          ? {
              ...page,
              sections: page.sections.map((section) =>
                section.id === sectionId
                  ? { ...section, items: [...section.items, { ...paletteItem, z: section.items.length }] }
                  : section,
              ),
            }
          : page,
      ),
    }));
    setSelectedSectionId(sectionId);
    setSelectedItemId(paletteItem.id);
    setStatus(`Added ${type} to ${activePage.slug}.`);
  }

  function onCanvasDrop(section: BuilderSection, event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    const x = rect ? Math.max(8, Math.round(event.clientX - rect.left - 120)) : 24;
    const y = rect ? Math.max(8, Math.round(event.clientY - rect.top - 24)) : 24;

    if (draggingPaletteType && activePage) {
      const nextItem = createPaletteItem(draggingPaletteType);
      nextItem.id = nextItemId(draggingPaletteType);
      nextItem.x = x;
      nextItem.y = y;
      updateState((state) => ({
        ...state,
        pages: state.pages.map((page) =>
          page.slug === activePage.slug
            ? {
                ...page,
                sections: page.sections.map((entry) =>
                  entry.id === section.id
                    ? { ...entry, items: [...entry.items, { ...nextItem, z: entry.items.length + 1 }] }
                    : entry,
                ),
              }
            : page,
        ),
      }));
      setSelectedSectionId(section.id);
      setSelectedItemId(nextItem.id);
      setDraggingPaletteType(null);
      return;
    }

    if (!draggingItemId || !activePage) return;
    updateState((state) => ({
      ...state,
      pages: state.pages.map((page) => {
        if (page.slug !== activePage.slug) return page;
        return {
          ...page,
          sections: page.sections.map((entry) => {
            const target = entry.id === section.id;
            const existing = entry.items.find((item) => item.id === draggingItemId);
            if (!existing && !target) return entry;
            if (existing && !target) {
              return { ...entry, items: entry.items.filter((item) => item.id !== draggingItemId) };
            }
            const incoming = existing
              ? { ...existing, x, y, z: entry.items.length + 1 }
              : null;
            const items = target
              ? existing
                ? entry.items.map((item) => (item.id === draggingItemId ? { ...item, x, y } : item))
                : [...entry.items, ...(incoming ? [incoming] : [])]
              : entry.items;
            return { ...entry, items };
          }),
        };
      }),
    }));
    setDraggingItemId(null);
  }

  function updateSelectedItem(mutator: (item: BuilderItem) => BuilderItem) {
    if (!activePage || !activeSection || !selectedItem) return;
    updateState((state) => ({
      ...state,
      pages: state.pages.map((page) =>
        page.slug === activePage.slug
          ? {
              ...page,
              sections: page.sections.map((section) =>
                section.id === activeSection.id
                  ? {
                      ...section,
                      items: section.items.map((item) => (item.id === selectedItem.id ? mutator(item) : item)),
                    }
                  : section,
              ),
            }
          : page,
      ),
    }));
  }

  function removeSelectedItem() {
    if (!activePage || !activeSection || !selectedItem) return;
    updateState((state) => ({
      ...state,
      pages: state.pages.map((page) =>
        page.slug === activePage.slug
          ? {
              ...page,
              sections: page.sections.map((section) =>
                section.id === activeSection.id
                  ? { ...section, items: section.items.filter((item) => item.id !== selectedItem.id) }
                  : section,
              ),
            }
          : page,
      ),
    }));
    setSelectedItemId(null);
  }

  function updateActivePage(mutator: (page: BuilderPage) => BuilderPage) {
    if (!activePage) return;
    updateState((state) => ({
      ...state,
      pages: state.pages.map((page) => (page.slug === activePage.slug ? mutator(page) : page)),
    }));
  }

  function updateActiveSection(mutator: (section: BuilderSection) => BuilderSection) {
    if (!activePage || !activeSection) return;
    updateState((state) => ({
      ...state,
      pages: state.pages.map((page) =>
        page.slug === activePage.slug
          ? {
              ...page,
              sections: page.sections.map((section) =>
                section.id === activeSection.id ? mutator(section) : section,
              ),
            }
          : page,
      ),
    }));
  }

  function onUndo() {
    if (pointer <= 0) return;
    setPointer(pointer - 1);
  }

  function onRedo() {
    if (pointer >= history.length - 1) return;
    setPointer(pointer + 1);
  }

  async function onSaveDraft() {
    const validationIssues = validateBuilderState(current);
    setIssues(validationIssues);
    if (validationIssues.length > 0) {
      setStatus('Fix validation issues before saving.');
      return;
    }

    try {
      setStatus('Saving draft...');
      const payload = projectBuilderStateToDraftPayload(current);
      const response = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          siteSlug: initialDraft.siteSlug,
          schemaVersion: payload.schemaVersion,
          layout: payload.layout,
          pages: payload.pages,
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
    const validationIssues = validateBuilderState(current);
    setIssues(validationIssues);
    if (validationIssues.length > 0) {
      setStatus('Fix validation issues before publishing.');
      return;
    }

    try {
      setStatus('Publishing...');
      const payload = projectBuilderStateToDraftPayload(current);
      const saveResponse = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          siteSlug: initialDraft.siteSlug,
          schemaVersion: payload.schemaVersion,
          layout: payload.layout,
          pages: payload.pages,
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
    <ThemeProvider>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn" type="button" onClick={onUndo} disabled={pointer <= 0}>Undo</button>
          <button className="btn" type="button" onClick={onRedo} disabled={pointer >= history.length - 1}>Redo</button>
          <button className="btn" type="button" onClick={onSaveDraft}>Save Draft</button>
          <button className="btn" type="button" onClick={onPublish}>Publish</button>
          <button className="btn" type="button" onClick={() => setShowJson((value) => !value)}>
            {showJson ? 'Hide JSON' : 'Show JSON'}
          </button>
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

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <strong>Pages</strong>
          {current.pages.map((page) => (
            <button
              key={page.slug}
              className="btn"
              type="button"
              style={{
                borderColor: activePage?.slug === page.slug ? '#60a5fa' : undefined,
                background: activePage?.slug === page.slug ? '#1e3a8a' : undefined,
              }}
              draggable
              onClick={() => {
                setActivePageSlug(page.slug);
                setSelectedSectionId(page.sections[0]?.id ?? null);
                setSelectedItemId(null);
              }}
              onDragStart={() => setDraggingPageSlug(page.slug)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => onPageDrop(page.slug)}
            >
              {page.slug}
            </button>
          ))}
          <button className="btn" type="button" onClick={addPage}>+ New Page</button>
          {activePage && (
            <>
              <button className="btn" type="button" onClick={() => renamePage(activePage.slug)}>Rename</button>
              <button className="btn" type="button" onClick={() => deletePage(activePage.slug)}>Delete</button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 320px', gap: 16 }}>
        <aside className="card">
          <h3 style={{ marginTop: 0 }}>Component Palette</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {COMPONENT_CATALOG.map((entry) => (
              <button
                key={entry.type}
                className="btn"
                type="button"
                draggable
                onDragStart={() => setDraggingPaletteType(entry.type)}
                onClick={() => addPaletteItem(entry.type)}
              >
                Add {entry.label}
              </button>
            ))}
          </div>
        </aside>

        <section className="card">
          <h3 style={{ marginTop: 0 }}>Canvas</h3>
          <p className="muted">Drop from palette to section areas. Drag blocks to position them like a game canvas.</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button className="btn" type="button" onClick={addSection}>+ Section</button>
            {activeSection && (
              <button
                className="btn"
                type="button"
                onClick={() =>
                  updateActiveSection((section) => ({
                    ...section,
                    mode: section.mode === 'free' ? 'stack' : 'free',
                  }))
                }
              >
                Toggle {activeSection.mode === 'free' ? 'Stack' : 'Free'}
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {(activePage?.sections ?? []).map((section) => (
              <div
                key={section.id}
                className="card"
                style={{
                  borderColor: selectedSectionId === section.id ? '#60a5fa' : undefined,
                }}
                onClick={() => {
                  setSelectedSectionId(section.id);
                  setSelectedItemId(null);
                }}
              >
                <div className="muted" style={{ marginBottom: 8 }}>
                  {section.title} ({section.mode})
                </div>
                <div
                  ref={selectedSectionId === section.id ? canvasRef : null}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => onCanvasDrop(section, event)}
                  style={{
                    position: 'relative',
                    minHeight: 240,
                    border: '1px dashed #334155',
                    borderRadius: 8,
                    padding: 8,
                    background: '#0f172a',
                  }}
                >
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => {
                        setDraggingItemId(item.id);
                        setSelectedItemId(item.id);
                        setSelectedSectionId(section.id);
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedItemId(item.id);
                        setSelectedSectionId(section.id);
                      }}
                      style={{
                        position: section.mode === 'free' ? 'absolute' : 'relative',
                        left: section.mode === 'free' ? item.x : 0,
                        top: section.mode === 'free' ? item.y : 0,
                        width: item.w,
                        minHeight: item.h,
                        border: selectedItemId === item.id ? '2px solid #60a5fa' : '1px solid #334155',
                        background: '#1e293b',
                        borderRadius: 8,
                        padding: 8,
                        cursor: 'move',
                        overflow: 'hidden',
                        zIndex: item.z,
                      }}
                    >
                      <div className="muted" style={{ marginBottom: 6 }}>
                        {item.type} · {item.id}
                      </div>
                      <div style={{ pointerEvents: 'none', transform: 'scale(0.95)', transformOrigin: 'top left' }}>
                        {renderSimulatorItem(item)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {showJson && (
            <>
              <div style={{ height: 12 }} />
              <label htmlFor="layout-json">Layout JSON (read-only debug)</label>
              <textarea id="layout-json" className="textarea" value={json.layoutText} readOnly />
              <div style={{ height: 12 }} />
              <label htmlFor="pages-json">Pages JSON (read-only debug)</label>
              <textarea id="pages-json" className="textarea" value={json.pagesText} readOnly />
            </>
          )}
        </section>

        <aside className="card">
          <h3 style={{ marginTop: 0 }}>Inspector</h3>
          {activePage && (
            <>
              <label className="muted">Page title</label>
              <input
                className="input"
                value={activePage.title}
                onChange={(event) => updateActivePage((page) => ({ ...page, title: event.target.value }))}
              />
              <div style={{ height: 8 }} />
              <label className="muted">Nav label</label>
              <input
                className="input"
                value={activePage.navLabel}
                onChange={(event) => updateActivePage((page) => ({ ...page, navLabel: event.target.value }))}
              />
            </>
          )}

          {activeSection && (
            <>
              <div style={{ height: 12 }} />
              <label className="muted">Section title</label>
              <input
                className="input"
                value={activeSection.title}
                onChange={(event) => updateActiveSection((section) => ({ ...section, title: event.target.value }))}
              />
            </>
          )}

          {selectedItem && selectedItemCatalog ? (
            <>
              <div style={{ height: 12 }} />
              <strong>Selected item</strong>
              <div className="muted" style={{ marginBottom: 8 }}>{selectedItem.id}</div>
              <button className="btn" type="button" onClick={removeSelectedItem}>Remove item</button>
              <div style={{ height: 8 }} />
              <label className="muted">x</label>
              <input
                className="input"
                type="number"
                value={selectedItem.x}
                onChange={(event) => updateSelectedItem((item) => ({ ...item, x: Number(event.target.value) }))}
              />
              <div style={{ height: 6 }} />
              <label className="muted">y</label>
              <input
                className="input"
                type="number"
                value={selectedItem.y}
                onChange={(event) => updateSelectedItem((item) => ({ ...item, y: Number(event.target.value) }))}
              />
              <div style={{ height: 6 }} />
              <label className="muted">width</label>
              <input
                className="input"
                type="number"
                value={selectedItem.w}
                onChange={(event) => updateSelectedItem((item) => ({ ...item, w: Number(event.target.value) }))}
              />

              <div style={{ height: 10 }} />
              <strong>Metadata</strong>
              <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                {selectedItemCatalog.inspectorFields.map((field) => {
                  const rawValue = selectedItem.metadata[field.key];
                  if (field.kind === 'boolean') {
                    return (
                      <label key={field.key} className="muted">
                        <input
                          type="checkbox"
                          checked={Boolean(rawValue)}
                          onChange={(event) =>
                            updateSelectedItem((item) => ({
                              ...item,
                              metadata: updateFieldValue(item.metadata, field, event.target.checked),
                            }))
                          }
                        />{' '}
                        {field.label}
                      </label>
                    );
                  }
                  if (field.kind === 'enum' && field.options) {
                    return (
                      <div key={field.key}>
                        <label className="muted">{field.label}</label>
                        <select
                          className="select"
                          value={typeof rawValue === 'string' ? rawValue : field.options[0]}
                          onChange={(event) =>
                            updateSelectedItem((item) => ({
                              ...item,
                              metadata: updateFieldValue(item.metadata, field, event.target.value),
                            }))
                          }
                        >
                          {field.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                  const isJsonField = field.kind === 'array';
                  const jsonFallback: unknown[] = [];
                  return (
                    <div key={field.key}>
                      <label className="muted">{field.label}</label>
                      {isJsonField ? (
                        <textarea
                          className="textarea"
                          value={JSON.stringify(rawValue ?? jsonFallback, null, 2)}
                          onChange={(event) =>
                            updateSelectedItem((item) => ({
                              ...item,
                              metadata: updateFieldValue(item.metadata, field, event.target.value),
                            }))
                          }
                        />
                      ) : (
                        <input
                          className="input"
                          value={String(rawValue ?? '')}
                          onChange={(event) =>
                            updateSelectedItem((item) => ({
                              ...item,
                              metadata: updateFieldValue(item.metadata, field, event.target.value),
                            }))
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="muted">Select an item on canvas to edit metadata and position.</p>
          )}
        </aside>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Live Webpage Simulator</h3>
        <p className="muted">Preview for active page {activePage?.slug ?? '/'} using shared ui-kit components.</p>
        <div style={{ display: 'grid', gap: 12, padding: 12, border: '1px solid #334155', borderRadius: 8 }}>
          {(activePage?.sections ?? []).map((section) => (
            <div key={section.id} className="card" style={{ background: '#0f172a' }}>
              <strong style={{ display: 'block', marginBottom: 8 }}>{section.title}</strong>
              <div style={{ display: 'grid', gap: 10 }}>
                {section.items
                  .slice()
                  .sort((a, b) => a.z - b.z)
                  .map((item) => (
                    <div key={`${section.id}-${item.id}`}>{renderSimulatorItem(item)}</div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ThemeProvider>
  );
}
