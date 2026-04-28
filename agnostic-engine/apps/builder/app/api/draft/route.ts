import { InMemoryDraftContentRepository } from '@agnostic/data-access';
import { NextResponse } from 'next/server';

const draftRepository = new InMemoryDraftContentRepository();

type DraftSaveBody = {
  siteSlug: string;
  layout: unknown;
  pages: Record<string, unknown>;
  schemaVersion?: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const siteSlug = url.searchParams.get('site')?.trim() || 'demo-site';
  const draft = draftRepository.getDraftSiteVersion({ siteSlug });
  return NextResponse.json(draft);
}

export async function POST(request: Request) {
  const body = (await request.json()) as DraftSaveBody;
  if (!body?.siteSlug) {
    return NextResponse.json({ error: 'siteSlug is required' }, { status: 400 });
  }

  const saved = draftRepository.saveDraftSiteVersion(
    { siteSlug: body.siteSlug, actorId: 'builder-user' },
    {
      schemaVersion: body.schemaVersion ?? '1.0',
      layout: body.layout,
      pages: body.pages,
    },
  );

  return NextResponse.json(saved);
}
