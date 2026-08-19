import { NextRequest, NextResponse } from 'next/server';
import { updateBookmark, deleteBookmark, getBookmark } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  if (!getBookmark(id)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const updated = updateBookmark(id, {
    title: body.title?.trim(),
    url: body.url?.trim(),
    description: body.description?.trim(),
    collection: body.collection,
    category: body.category,
    tags: body.tags,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  deleteBookmark(id);
  return NextResponse.json({ ok: true });
}