import { describe, expect, it } from 'vitest';
import {
  createBuilderStateFromDraft,
  createDraftPayloadFromBuilderState,
  createNewPage,
  moveInArray,
  validateBuilderState,
  type DraftSiteVersion,
} from '../builder-state';

const draft: DraftSiteVersion = {
  siteSlug: 'demo-site',
  schemaVersion: '1.0',
  updatedAt: '2026-04-01T12:00:00.000Z',
  layout: { schemaVersion: '1.0', sidebar: { extras: [] } },
  pages: {
    '/': {
      schemaVersion: '1.0',
      title: 'Home',
      nav: { label: 'Home', order: 0 },
      components: [
        { id: 'hero-button', type: 'button', props: { metadata: { labelKey: 'Hero', variant: 'primary' } } },
      ],
    },
    '/about': {
      schemaVersion: '1.0',
      title: 'About',
      nav: { label: 'About', order: 1 },
      components: [],
    },
  },
};

describe('builder state projection', () => {
  it('creates builder pages with sections from draft', () => {
    const state = createBuilderStateFromDraft(draft);
    expect(state.pages).toHaveLength(2);
    expect(state.pages[0].slug).toBe('/');
    expect(state.pages[0].sections[0].items[0].type).toBe('button');
  });

  it('projects builder state back to draft payload', () => {
    const state = createBuilderStateFromDraft(draft);
    const payload = createDraftPayloadFromBuilderState(state);
    expect(payload.pages['/']).toBeDefined();
    const home = payload.pages['/'] as { components: Array<{ type: string }> };
    expect(home.components[0].type).toBe('button');
  });

  it('validates missing root page', () => {
    const state = createBuilderStateFromDraft(draft);
    const withoutRoot = { ...state, pages: state.pages.filter((page) => page.slug !== '/') };
    expect(validateBuilderState(withoutRoot)).toContain('Pages must include "/" root page.');
  });
});

describe('builder state helpers', () => {
  it('creates normalized page slugs', () => {
    const page = createNewPage('  /Pricing Page  ', 3);
    expect(page.slug).toBe('/pricing-page');
    expect(page.navOrder).toBe(3);
  });

  it('moves items in array safely', () => {
    expect(moveInArray([1, 2, 3], 0, 2)).toEqual([2, 3, 1]);
    expect(moveInArray([1, 2, 3], -1, 2)).toEqual([1, 2, 3]);
  });
});

