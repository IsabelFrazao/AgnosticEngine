import { InMemoryDraftContentRepository } from '@agnostic/data-access';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const draftRepository = new InMemoryDraftContentRepository();

type BuilderPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function resolveSiteSlug(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && value.trim().length > 0 ? value.trim() : 'demo-site';
}

export default async function BuilderPage({ searchParams }: BuilderPageProps) {
  const params = (await searchParams) ?? {};
  const siteSlug = resolveSiteSlug(params.site);
  const draft = draftRepository.getDraftSiteVersion({ siteSlug });

  async function saveDraftAction(formData: FormData) {
    'use server';

    const targetSiteSlug = resolveSiteSlug(formData.get('siteSlug') as string | undefined);
    const layoutRaw = String(formData.get('layout') ?? '{}');
    const pagesRaw = String(formData.get('pages') ?? '{}');

    let layout: unknown;
    let pages: Record<string, unknown>;
    try {
      layout = JSON.parse(layoutRaw) as unknown;
      pages = JSON.parse(pagesRaw) as Record<string, unknown>;
    } catch {
      redirect(`/builder?site=${encodeURIComponent(targetSiteSlug)}&error=invalid-json`);
    }

    draftRepository.saveDraftSiteVersion(
      { siteSlug: targetSiteSlug, actorId: 'builder-user' },
      {
        schemaVersion: '1.0',
        layout,
        pages,
      },
    );

    revalidatePath(`/builder?site=${encodeURIComponent(targetSiteSlug)}`);
    redirect(`/builder?site=${encodeURIComponent(targetSiteSlug)}&saved=1`);
  }

  return (
    <main>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Builder MVP Shell</h1>
          <p className="muted" style={{ marginTop: 6 }}>
            M5 scaffold: protected builder routes, site selector, canvas shell, and draft save/load via data-access.
          </p>
        </div>
        <form method="post" action="/api/auth/logout">
          <button type="submit" className="btn">Sign out</button>
        </form>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <form method="get" action="/builder" style={{ display: 'flex', gap: 12, alignItems: 'end' }}>
          <div style={{ minWidth: 260 }}>
            <label htmlFor="site" className="muted">Site</label>
            <select id="site" name="site" defaultValue={siteSlug} className="select">
              <option value="demo-site">demo-site</option>
              <option value="marketing-site">marketing-site</option>
              <option value="academy-site">academy-site</option>
            </select>
          </div>
          <button className="btn" type="submit">Load draft</button>
          <span className="muted">Last updated: {new Date(draft.updatedAt).toLocaleString()}</span>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 280px', gap: 16 }}>
        <aside className="card">
          <h3 style={{ marginTop: 0 }}>Component Palette</h3>
          <ul className="muted">
            <li>Button</li>
            <li>Table</li>
            <li>Theme Switcher</li>
          </ul>
        </aside>

        <section className="card">
          <h3 style={{ marginTop: 0 }}>Canvas</h3>
          <p className="muted">Drag/drop interactions are M6. For M5, edit draft JSON and persist.</p>

          <form action={saveDraftAction}>
            <input type="hidden" name="siteSlug" value={siteSlug} />
            <label htmlFor="layout">Layout JSON</label>
            <textarea
              id="layout"
              name="layout"
              className="textarea"
              defaultValue={JSON.stringify(draft.layout, null, 2)}
            />
            <div style={{ height: 12 }} />
            <label htmlFor="pages">Pages JSON</label>
            <textarea
              id="pages"
              name="pages"
              className="textarea"
              defaultValue={JSON.stringify(draft.pages, null, 2)}
            />
            <div style={{ height: 12 }} />
            <button type="submit" className="btn">Save draft</button>
          </form>
        </section>

        <aside className="card">
          <h3 style={{ marginTop: 0 }}>Inspector</h3>
          <p className="muted">Selection and field-level inspector are scaffolded for M5 and will be expanded in M6.</p>
        </aside>
      </div>
    </main>
  );
}
