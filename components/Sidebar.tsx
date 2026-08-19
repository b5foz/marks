'use client';

import { useState } from 'react';
import { Hash, Plus, Inbox, Bookmark, Menu, X, BarChart2, Sun } from 'lucide-react';
import { Collection } from '../types';
import '../app/globals.css';

interface SidebarProps {
  bookmarksCount: number;
  uncollectedCount: number;
  tagsCount: number;
  collections: Collection[];
  selectedCollection: string;
  setSelectedCollection: (collection: string) => void;
  setShowModal: (show: boolean) => void;
}

const COLORS = ['#5C6BFF', '#10B981', '#F5A623', '#E11D48', '#8B5CF6'];

function NavItem({
  id,
  icon: Icon,
  label,
  count,
  selectedCollection,
  onSelect,
}: {
  id: string;
  icon: React.ElementType;
  label: string;
  count?: number;
  selectedCollection: string;
  onSelect: (id: string) => void;
}) {
  const active = selectedCollection === id;
  return (
    <button
      onClick={() => onSelect(id)}
      className={`sidebar-item ${active ? 'active' : ''}`}
    >
      <div className="sidebar-item-content">
        <Icon className="sidebar-icon" />
        <span>{label}</span>
      </div>
      {count !== undefined && count >= 0 && (
        <span className="sidebar-badge">{count}</span>
      )}
    </button>
  );
}

function SidebarContent({
  bookmarksCount,
  uncollectedCount,
  tagsCount,
  collections,
  selectedCollection,
  onSelect,
  onNewBookmark,
  onNewAction,
  onCloseMobile,
}: {
  bookmarksCount: number;
  uncollectedCount: number;
  tagsCount: number;
  collections: Collection[];
  selectedCollection: string;
  onSelect: (id: string) => void;
  onNewBookmark: () => void;
  onNewAction: (type: string) => void;
  onCloseMobile: () => void;
}) {
  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Bookmark size={20} fill="var(--accent-primary)" color="var(--accent-primary)" />
          Marks.
        </div>
        <button className="mobile-close" onClick={onCloseMobile}>
          <X size={20} />
        </button>
      </div>

      <div className="sidebar-action">
        <button className="new-bookmark-btn" onClick={onNewBookmark}>
          <Plus size={16} />
          New Bookmark
        </button>
      </div>

      <div className="sidebar-nav">
        <div className="nav-group">
          <NavItem id="All Bookmarks" icon={BarChart2} label="All Bookmarks" count={bookmarksCount} selectedCollection={selectedCollection} onSelect={onSelect} />
          <NavItem id="Uncollected" icon={Inbox} label="Uncollected" selectedCollection={selectedCollection} onSelect={onSelect} />
          <NavItem id="Tags" icon={Hash} label="Tags" count={tagsCount} selectedCollection={selectedCollection} onSelect={onSelect} />
        </div>

        <div className="collections-group" style={{ marginTop: '16px' }}>
          <div className="collections-header">
            <span>Collections</span>
            <button className="add-collection-btn" onClick={() => onNewAction('collection')}>
              <Plus size={14} />
            </button>
          </div>

          <div className="nav-group">
            {collections?.map((col, index) => {
              const active = selectedCollection === col.name;
              return (
                <button
                  key={col.name}
                  onClick={() => onSelect(col.name)}
                  className={`sidebar-item ${active ? 'active' : ''}`}
                >
                  <div className="sidebar-item-content">
                    <div className="collection-color" style={{ background: COLORS[index % COLORS.length] }} />
                    <span>{col.name}</span>
                  </div>
                  <span className="sidebar-badge">{col.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({
  bookmarksCount,
  uncollectedCount,
  tagsCount,
  collections,
  selectedCollection,
  setSelectedCollection,
  setShowModal,
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedCollection(id);
    setIsMobileOpen(false);
  };

  const handleNewBookmark = () => {
    setShowModal(true);
    setIsMobileOpen(false);
  };

  return (
    <>
      <div className="desktop-sidebar">
        <SidebarContent
          bookmarksCount={bookmarksCount}
          uncollectedCount={uncollectedCount}
          tagsCount={tagsCount}
          collections={collections}
          selectedCollection={selectedCollection}
          onSelect={handleSelect}
          onNewBookmark={handleNewBookmark}
          onNewAction={(type) => {
            // Dispatch a custom event or you can add a new prop to handle collection modal
            window.dispatchEvent(new CustomEvent('open-new-collection-modal'));
          }}
          onCloseMobile={() => setIsMobileOpen(false)}
        />
      </div>

      <button className="mobile-menu-btn" onClick={() => setIsMobileOpen(true)}>
        <Menu size={20} />
      </button>

      {/* Simplified Mobile Overlay for brevity */}
      {isMobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'var(--bg-main)' }}>
          <SidebarContent
            bookmarksCount={bookmarksCount}
            uncollectedCount={uncollectedCount}
            tagsCount={tagsCount}
            collections={collections}
            selectedCollection={selectedCollection}
            onSelect={handleSelect}
            onNewBookmark={handleNewBookmark}
            onNewAction={() => window.dispatchEvent(new CustomEvent('open-new-collection-modal'))}
            onCloseMobile={() => setIsMobileOpen(false)}
          />
        </div>
      )}
    </>
  );
}
