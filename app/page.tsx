'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import { BookmarkType, Collection } from '../types';
import { X, MoreHorizontal, Pencil, Trash2, ChevronLeft } from 'lucide-react';
import './globals.css';

// Fixed color per collection name
const COLLECTION_COLORS: Record<string, string> = {
  'Design':      '#6366F1',
  'Engineering': '#10B981',
  'Reading':     '#F5A623',
};
const FALLBACK_COLORS = ['#5C6BFF', '#10B981', '#F5A623', '#E11D48', '#8B5CF6'];

function getCollectionColor(name: string, allNames: string[]): string {
  if (COLLECTION_COLORS[name]) return COLLECTION_COLORS[name];
  return FALLBACK_COLORS[allNames.indexOf(name) % FALLBACK_COLORS.length];
}

const INITIAL_BOOKMARKS: BookmarkType[] = [
  
];

const COLORS = ['#EF4444','#F97316','#F59E0B','#EAB308','#84CC16','#22C55E','#10B981','#14B8A6','#06B6D4','#0EA5E9','#3B82F6','#6366F1','#8B5CF6','#A855F7','#D946EF','#EC4899','#F43F5E','#FB7185','#FDA4AF','#A3A3A3'];

function getFaviconUrl(url: string) {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`; }
  catch { return ''; }
}

function getDomain(url: string) {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch { return url; }
}

export default function Page() {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>(INITIAL_BOOKMARKS);
  const [filteredBookmarks, setFilteredBookmarks] = useState<BookmarkType[]>(INITIAL_BOOKMARKS);
  const [isLoaded, setIsLoaded] = useState(false);

  const [customCollections, setCustomCollections] = useState<{name: string, color: string}[]>([]);

  useEffect(() => {
    const savedBookmarks = localStorage.getItem('marks_bookmarks');
    if (savedBookmarks) {
      try {
        const parsed = JSON.parse(savedBookmarks);
        if (Array.isArray(parsed)) {
          setBookmarks(parsed);
        }
      } catch (e) {
        console.error('Failed to parse bookmarks', e);
      }
    }
    const savedCollections = localStorage.getItem('marks_collections');
    if (savedCollections) {
      try {
        const parsed = JSON.parse(savedCollections);
        if (Array.isArray(parsed)) {
          setCustomCollections(parsed);
        }
      } catch (e) {
        console.error('Failed to parse collections', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('marks_bookmarks', JSON.stringify(bookmarks));
      localStorage.setItem('marks_collections', JSON.stringify(customCollections));
    }
  }, [bookmarks, customCollections, isLoaded]);

  useEffect(() => { setFilteredBookmarks(bookmarks); }, [bookmarks]);

  // Derived collections — auto-synced when bookmarks change
  const collections = useMemo<Collection[]>(() => {
    const map: Record<string, { count: number, color?: string }> = {};
    customCollections.forEach(c => {
      map[c.name] = { count: 0, color: c.color };
    });
    bookmarks.forEach(b => {
      if (b.collection) {
        if (!map[b.collection]) {
          map[b.collection] = { count: 0, color: getCollectionColor(b.collection, []) };
        }
        map[b.collection].count += 1;
      }
    });
    return Object.entries(map).map(([name, data]) => ({ name, count: data.count, color: data.color }));
  }, [bookmarks, customCollections]);

  const collectionNames = useMemo(() => collections.map(c => c.name), [collections]);

  // Unique tag count — auto-synced
  const allTags = useMemo(() => {
    const map: Record<string, number> = {};
    bookmarks.forEach(b => {
      b.tags.forEach(t => {
        map[t] = (map[t] || 0) + 1;
      });
    });
    return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));
  }, [bookmarks]);
  const tagsCount = allTags.length;

  const [selectedCollection, setSelectedCollection] = useState('All Bookmarks');
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [addUrl, setAddUrl] = useState('');
  const [addTitle, setAddTitle] = useState('');
  const [addCollection, setAddCollection] = useState('');
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const [editingBookmark, setEditingBookmark] = useState<BookmarkType | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editCollection, setEditCollection] = useState('');

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setShowNewCollection(true);
    window.addEventListener('open-new-collection-modal', fn);
    return () => window.removeEventListener('open-new-collection-modal', fn);
  }, []);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    };
    if (openMenuId) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [openMenuId]);

  const openAddModal = (show: boolean) => {
    if (show) {
      setAddUrl('');
      setAddTitle('');
      const def = !['All Bookmarks', 'Uncollected', 'Tags'].includes(selectedCollection) && !selectedCollection.startsWith('Tag: ') ? selectedCollection : '';
      setAddCollection(def);
      setShowAddBookmark(true);
    } else {
      setShowAddBookmark(false);
    }
  };

  const handleAddBookmark = () => {
    if (!addUrl.trim()) return;
    const newBookmark: BookmarkType = {
      id: Date.now().toString(),
      url: addUrl.trim(),
      title: addTitle.trim() || addUrl.trim(),
      description: '',
      collection: addCollection,
      category: 'Uncategorized',
      tags: []
    };
    setBookmarks(prev => [newBookmark, ...prev]);
    setShowAddBookmark(false);
    setAddUrl('');
    setAddTitle('');
    setAddCollection('');
  };


  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;
    const exists = customCollections.some(c => c.name.toLowerCase() === newCollectionName.trim().toLowerCase());
    if (!exists) {
      setCustomCollections(prev => [...prev, { name: newCollectionName.trim(), color: selectedColor }]);
    }
    setShowNewCollection(false);
    setNewCollectionName('');
  };

  const handleEdit = (bookmark: BookmarkType) => {
    setEditingBookmark(bookmark);
    setEditUrl(bookmark.url);
    setEditTitle(bookmark.title);
    setEditDesc(bookmark.description);
    setEditTags(bookmark.tags.join(', '));
    setEditCollection(bookmark.collection || '');
    setOpenMenuId(null);
  };

  const handleSaveEdit = () => {
    if (!editingBookmark) return;
    setBookmarks(prev =>
      prev.map(b =>
        b.id === editingBookmark.id
          ? { 
              ...b, 
              url: editUrl.trim(), 
              title: editTitle.trim(), 
              description: editDesc.trim(),
              collection: editCollection,
              tags: editTags.split(',').map(t => t.trim()).filter(Boolean)
            }
          : b
      )
    );
    setEditingBookmark(null);
  };

  const handleDelete = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
    setOpenMenuId(null);
  };

  const isTagView = selectedCollection.startsWith('Tag: ');
  const isCollectionView = !['All Bookmarks', 'Uncollected', 'Tags'].includes(selectedCollection) && !isTagView;

  const displayBookmarks = filteredBookmarks.filter(b => {
    if (selectedCollection === 'All Bookmarks') return true;
    if (selectedCollection === 'Uncollected') return !b.collection;
    if (selectedCollection.startsWith('Tag: ')) {
      const tag = selectedCollection.replace('Tag: ', '');
      return b.tags.includes(tag);
    }
    return b.collection === selectedCollection;
  });

  const btnStyle = (variant: 'primary' | 'ghost' = 'primary'): React.CSSProperties => ({
    padding: '10px 22px',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    border: variant === 'ghost' ? '1px solid var(--border-subtle)' : 'none',
    background: variant === 'ghost' ? 'transparent' : 'var(--accent-primary)',
    color: variant === 'ghost' ? 'var(--text-secondary)' : '#fff',
  });

  return (
    <div className="app-container">
      <Sidebar
        bookmarksCount={bookmarks.length}
        uncollectedCount={bookmarks.filter(b => !b.collection).length}
        tagsCount={tagsCount}
        allTags={allTags}
        collections={collections}
        selectedCollection={selectedCollection}
        setSelectedCollection={setSelectedCollection}
        setShowModal={openAddModal}
      />

      <main className="main-content">
        {isCollectionView ? (
          <div className="collection-detail-header">
            <div className="collection-detail-topbar">
              <button className="back-btn" onClick={() => setSelectedCollection('All Bookmarks')}>
                <ChevronLeft size={15} />
                All Bookmarks
              </button>
              <button className="collection-header-menu-btn">
                <MoreHorizontal size={18} />
              </button>
            </div>
            <div className="collection-detail-title-row">
              {isTagView ? (
                 <Hash size={24} style={{ marginRight: '12px' }} />
              ) : (
                 <div className="collection-dot-lg" style={{ background: collections.find(c => c.name === selectedCollection)?.color || getCollectionColor(selectedCollection, collectionNames) }} />
              )}
              <h2 className="page-title">{isTagView ? selectedCollection.replace('Tag: ', '#') : selectedCollection}</h2>
            </div>
          </div>
        ) : (
          <div className="top-header">
            <h2 className="page-title">{selectedCollection}</h2>
            <SearchBar bookmarks={bookmarks} onFilter={setFilteredBookmarks} />
          </div>
        )}

        <div className="bookmarks-grid">
          {displayBookmarks.map((bookmark) => (
            <article key={bookmark.id} className="bookmark-card">
              <div className="card-header">
                <div className="card-icon-wrapper">
                  <img src={getFaviconUrl(bookmark.url)} alt="" loading="lazy" />
                </div>
                <div className="card-title-group">
                  <h3 className="card-title">{bookmark.title}</h3>
                  <div className="card-meta">
                    <span>{getDomain(bookmark.url)}</span>
                    <span>•</span>
                    <span>{bookmark.category}</span>
                  </div>
                </div>

                <div className="card-menu-wrapper" ref={openMenuId === bookmark.id ? menuRef : null}>
                  <button
                    className={`card-menu-btn ${openMenuId === bookmark.id ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === bookmark.id ? null : bookmark.id);
                    }}
                    aria-label="Card options"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {openMenuId === bookmark.id && (
                    <div className="card-dropdown">
                      <button className="card-dropdown-item" onClick={() => handleEdit(bookmark)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="card-dropdown-item card-dropdown-item--danger" onClick={() => handleDelete(bookmark.id)}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className="card-desc">{bookmark.description}</p>
              <div className="card-tags">
                {bookmark.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
              </div>
            </article>
          ))}
          {displayBookmarks.length === 0 && (
            <div style={{ color: 'var(--text-muted)', marginTop: '20px' }}>No bookmarks found.</div>
          )}
        </div>
      </main>

      {showAddBookmark && (
        <div className="modal-overlay" onClick={() => openAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => openAddModal(false)}><X size={20} /></button>
            <h3 className="modal-title serif-text">Add Bookmark</h3>
            <p className="modal-subtitle">Save a new link to your archive.</p>
            <div className="modal-field">
              <label className="modal-label">URL</label>
              <input type="text" className="modal-input" placeholder="https://..." value={addUrl} onChange={e => setAddUrl(e.target.value)} autoFocus />
            </div>
            <div className="modal-field">
              <label className="modal-label">Title</label>
              <input type="text" className="modal-input" placeholder="Optional" value={addTitle} onChange={e => setAddTitle(e.target.value)} />
            </div>
            <div className="modal-field">
              <label className="modal-label">Collection</label>
              <select className="modal-input" value={addCollection} onChange={e => setAddCollection(e.target.value)}>
                <option value="">None</option>
                {collectionNames.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
              <button style={btnStyle()} onClick={handleAddBookmark}>Save</button>
            </div>
          </div>
        </div>
      )}

      {editingBookmark && (
        <div className="modal-overlay" onClick={() => setEditingBookmark(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEditingBookmark(null)}><X size={20} /></button>
            <h3 className="modal-title serif-text">Edit Bookmark</h3>
            <p className="modal-subtitle">Update your bookmark details.</p>
            <div className="modal-field">
              <label className="modal-label">URL</label>
              <input type="text" className="modal-input modal-input--accent" value={editUrl} onChange={e => setEditUrl(e.target.value)} autoFocus />
            </div>
            <div className="modal-field">
              <label className="modal-label">Title</label>
              <input type="text" className="modal-input" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            </div>
            <div className="modal-field">
              <label className="modal-label">Description</label>
              <textarea className="modal-input modal-textarea" value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} />
            </div>
            <div className="modal-field">
              <label className="modal-label">Tags (comma separated)</label>
              <input type="text" className="modal-input" value={editTags} onChange={e => setEditTags(e.target.value)} placeholder="design, inspiration, frontend" />
            </div>
            <div className="modal-field">
              <label className="modal-label">Collection</label>
              <select className="modal-input" value={editCollection} onChange={e => setEditCollection(e.target.value)}>
                <option value="">None</option>
                {collectionNames.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '32px' }}>
              <button style={btnStyle('ghost')} onClick={() => setEditingBookmark(null)}>Cancel</button>
              <button style={btnStyle()} onClick={handleSaveEdit}>Save changes</button>
            </div>
          </div>
        </div>
      )}

      {showNewCollection && (
        <div className="modal-overlay" onClick={() => { setShowNewCollection(false); setNewCollectionName(''); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setShowNewCollection(false); setNewCollectionName(''); }}><X size={20} /></button>
            <h3 className="modal-title serif-text">New Collection</h3>
            <p className="modal-subtitle">Group related bookmarks together.</p>
            <div className="modal-field">
              <label className="modal-label">Name</label>
              <input type="text" className="modal-input" placeholder="e.g. Design Inspiration" value={newCollectionName} onChange={e => setNewCollectionName(e.target.value)} autoFocus />
            </div>
            <div className="modal-field" style={{ marginTop: '24px' }}>
              <label className="modal-label" style={{ marginBottom: '12px' }}>Color</label>
              <div className="color-picker-grid">
                {COLORS.map(color => (
                  <div key={color} className={`color-option ${selectedColor === color ? 'selected' : ''}`} style={{ background: color }} onClick={() => setSelectedColor(color)} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
              <button style={btnStyle()} onClick={handleCreateCollection}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}