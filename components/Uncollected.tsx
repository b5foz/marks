import React from 'react';
import { BookmarkType } from '../types';
import Bookmarks from './Bookmarks';

interface UncollectedProps {
  bookmarks: BookmarkType[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleDeleteBookmark: (id: string) => void;
}

export default function Uncollected({ bookmarks, searchQuery, setSearchQuery, handleDeleteBookmark }: UncollectedProps) {
  const uncollectedBookmarks = bookmarks.filter(bm => bm.collection === 'Uncollected');
  
  return (
    <Bookmarks 
      bookmarks={uncollectedBookmarks} 
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      handleDeleteBookmark={handleDeleteBookmark} 
    />
  );
}
