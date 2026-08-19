import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { BookmarkType } from '@/types';

const dataDir = path.join(process.cwd(), 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'marks.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS bookmarks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    collection TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

type BookmarkRow = {
  id: string;
  title: string;
  url: string;
  description: string;
  collection: string;
  category: string;
  tags: string;
  created_at: string;
};

function rowToBookmark(row: BookmarkRow): BookmarkType {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    description: row.description,
    collection: row.collection,
    category: row.category,
    tags: JSON.parse(row.tags),
  };
}

export function listBookmarks(): BookmarkType[] {
  const rows = db.prepare('SELECT * FROM bookmarks ORDER BY created_at DESC').all() as BookmarkRow[];
  return rows.map(rowToBookmark);
}

export function getBookmark(id: string): BookmarkType | undefined {
  const row = db.prepare('SELECT * FROM bookmarks WHERE id = ?').get(id) as BookmarkRow | undefined;
  return row ? rowToBookmark(row) : undefined;
}

export function insertBookmark(bookmark: BookmarkType): BookmarkType {
  db.prepare(`
    INSERT INTO bookmarks (id, title, url, description, collection, category, tags)
    VALUES (@id, @title, @url, @description, @collection, @category, @tags)
  `).run({ ...bookmark, tags: JSON.stringify(bookmark.tags) });
  return bookmark;
}

export function updateBookmark(id: string, patch: Partial<BookmarkType>): BookmarkType | undefined {
  const existing = getBookmark(id);
  if (!existing) return undefined;
  const merged: BookmarkType = { ...existing, ...patch, id };
  db.prepare(`
    UPDATE bookmarks
    SET title = @title, url = @url, description = @description,
        collection = @collection, category = @category, tags = @tags
    WHERE id = @id
  `).run({ ...merged, tags: JSON.stringify(merged.tags) });
  return merged;
}

export function deleteBookmark(id: string): void {
  db.prepare('DELETE FROM bookmarks WHERE id = ?').run(id);
}

export default db;