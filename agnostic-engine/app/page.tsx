import { MetadataEngine } from '@/src/components/MetadataEngine';
import { FormattedUtc } from '@/src/components/atoms/FormattedUtc';
import { DEMO_UPDATED_AT } from '@/src/data/demo-schema';
import { mockSchema } from '@/src/data/mock-schema';

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-[var(--background)] font-sans">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Agnostic Metadata CMS
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Sample schema below. UTC value{' '}
            <code className="rounded bg-[var(--color-muted)] px-1.5 py-0.5 text-xs">
              {DEMO_UPDATED_AT}
            </code>{' '}
            formatted for display with date-fns:{' '}
            <FormattedUtc iso={DEMO_UPDATED_AT} />
          </p>
        </header>
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
          <MetadataEngine schema={mockSchema} />
        </section>
      </main>
    </div>
  );
}
