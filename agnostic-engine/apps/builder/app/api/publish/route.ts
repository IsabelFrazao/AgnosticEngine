import { InMemoryDraftContentRepository } from '@agnostic/data-access';
import { NextResponse } from 'next/server';

const draftRepository = new InMemoryDraftContentRepository();

export async function POST(request: Request) {
  const body = (await request.json()) as { siteSlug?: string };
  const siteSlug = body?.siteSlug?.trim();
  if (!siteSlug) {
    return NextResponse.json({ error: 'siteSlug is required' }, { status: 400 });
  }

  const published = draftRepository.publishDraftSiteVersion({
    siteSlug,
    actorId: 'builder-user',
  });

  return NextResponse.json({
    status: 'published',
    siteSlug,
    updatedAt: published.updatedAt,
  });
}
