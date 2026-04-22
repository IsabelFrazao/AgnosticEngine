import { notFound } from 'next/navigation';
import { MetadataEngine } from '@/src/engines/MetadataEngine';
import { MOCK_PAGES } from '@/src/data/mock-data';

type PageProps = { params: Promise<{ slug: string[] }> };

/**
 * Catch-all dynamic page renderer.
 *
 * Joins slug segments to reconstruct the manifest key:
 *   ["courses"]          → "/courses"
 *   ["courses","modules"] → "/courses/modules"
 *
 * Returns Next.js 404 if the slug has no entry in the pages manifest.
 * Replace MOCK_PAGES with an API fetch when the backend is ready.
 */
export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const path = `/${slug.join('/')}`;
  const page = MOCK_PAGES[path];

  if (!page) notFound();

  return (
    <div className="flex min-h-full flex-col bg-(--background) font-sans">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
        {page.header && (
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-(--color-foreground)">
              {page.header.title}
            </h1>
            {page.header.description && (
              <p className="text-sm text-(--color-muted-foreground)">
                {page.header.description}
              </p>
            )}
          </header>
        )}

        {page.components.length > 0 ? (
          <section className="rounded-xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm">
            <MetadataEngine schema={page.components} />
          </section>
        ) : (
          <section className="rounded-xl border border-(--color-border) border-dashed bg-(--color-surface) p-12 text-center">
            <p className="text-sm text-(--color-muted-foreground)">
              No components registered for this page yet.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export async function generateStaticParams() {
  return Object.keys(MOCK_PAGES)
    .filter(slug => slug !== '/')
    .map(slug => ({
      // Remove leading "/" and split into segments
      slug: slug.replace(/^\//, '').split('/'),
    }));
}
