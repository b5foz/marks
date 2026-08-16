'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { BookmarkType } from '../types';
import '../app/globals.css';

interface SearchBarProps {
  bookmarks: BookmarkType[];
  onFilter: (filtered: BookmarkType[]) => void;
}

export default function SearchBar({ bookmarks, onFilter }: SearchBarProps) {
  const [search, setSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useMemo(() => {
    if (!search.trim()) {
      onFilter(bookmarks);
      return;
    }
    const query = search.toLowerCase();
    const results = bookmarks.filter(b =>
      b.title?.toLowerCase().includes(query) ||
      b.url.toLowerCase().includes(query) ||
      b.description?.toLowerCase().includes(query) ||
      b.tags.some(t => t.toLowerCase().includes(query))
    );
    onFilter(results);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmarks, search]);

  return (
    <div className={`search-container ${isFocused ? 'focused' : ''}`}>
      <Search className="search-icon" />
      <input
        type="text"
        placeholder="Search by title, url, or tag..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="search-input"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
}
