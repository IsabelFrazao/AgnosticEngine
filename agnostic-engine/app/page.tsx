import { MetadataEngine } from '@/src/engines/MetadataEngine';
import { FormattedUtc } from '@/src/components/atoms/FormattedUtc';
import { DEMO_UPDATED_AT, MOCK_PAGES } from '@/src/data/mock-data';
import { MOCK_CURRENT_USER_PERMISSIONS } from '@/src/data/mock-auth';

const homePage = MOCK_PAGES['/'];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-(--background) font-sans">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
        {homePage.header && (
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-(--color-foreground)">
              {homePage.header.title}
            </h1>
            <p className="text-sm text-(--color-muted-foreground)">
              {homePage.header.description} UTC demo:{' '}
              <code className="rounded bg-(--color-muted) px-1.5 py-0.5 text-xs">
                {DEMO_UPDATED_AT}
              </code>{' '}
              → <FormattedUtc iso={DEMO_UPDATED_AT} />
            </p>
          </header>
        )}
        <section className="rounded-xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm">
          <MetadataEngine
            schema={homePage.components}
            currentUserPermissions={MOCK_CURRENT_USER_PERMISSIONS}
          />
        </section>
      </main>
    </div>
  );
}
