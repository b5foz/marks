export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { listBookmarks, insertBookmark } from '@/lib/db';
import { BookmarkType } from '@/types';

export async function GET() {
  return NextResponse.json(listBookmarks());
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body?.url || typeof body.url !== 'string') {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  const bookmark: BookmarkType = {
    id: randomUUID(),
    title: (body.title?.trim() || body.url) as string,
    url: body.url.trim(),
    description: (body.description?.trim() ?? '') as string,
    collection: (body.collection ?? '') as string,
    category: (body.category ?? '') as string,
    tags: Array.isArray(body.tags) ? body.tags : [],
  };

  insertBookmark(bookmark);
  return NextResponse.json(bookmark, { status: 201 });
}