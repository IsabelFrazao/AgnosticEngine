import { MetadataEngine } from '@/src/components/MetadataEngine';
import { FormattedUtc } from '@/src/components/atoms/FormattedUtc';
import { DEMO_UPDATED_AT, demoSchema } from '@/src/data/demo-schema';

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Agnostic Metadata CMS
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Sample schema below. UTC value{' '}
            <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
              {DEMO_UPDATED_AT}
            </code>{' '}
            formatted for display with date-fns:{' '}
            <FormattedUtc iso={DEMO_UPDATED_AT} />
          </p>
        </header>
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <MetadataEngine schema={demoSchema} />
        </section>
      </main>
    </div>
  );
}
