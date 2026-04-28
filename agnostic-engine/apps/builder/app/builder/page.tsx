import { InMemoryDraftContentRepository } from '@agnostic/data-access';
import { BuilderStudio } from './BuilderStudio';

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

      <BuilderStudio initialDraft={draft} />
    </main>
  );
}
