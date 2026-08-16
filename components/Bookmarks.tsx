import { MoreHorizontal } from 'lucide-react';
import { BookmarkType } from '../types';
import Favicon from './Favicon';

interface BookmarksProps {
  bookmarks: BookmarkType[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleDeleteBookmark: (id: string) => void;
}

export default function Bookmarks({ bookmarks, searchQuery, setSearchQuery, handleDeleteBookmark }: BookmarksProps) {
  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  if (bookmarks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#7B7265]">
        <p>No bookmarks found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-5">
      {bookmarks.map((bm) => (
        <div
          key={bm.id}
          className="bg-[#191B1D] border border-[#26282B] rounded-[18px] p-[22px] hover:bg-[#1E2023] hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 group flex flex-col cursor-pointer"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <Favicon url={bm.url} title={bm.title} />
              <div>
                <h3 className="font-medium text-[#EBE7E0] text-[15px] leading-snug mb-1">
                  {bm.title}
                </h3>
                <div className="flex items-center gap-2 text-[13px] text-[#8C8477]">
                  <span className="truncate max-w-[140px]">{getDomain(bm.url)}</span>
                  {bm.category && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-[#4A4A55]" />
                      <span>{bm.category}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDeleteBookmark(bm.id)}
              className="text-[#4A4A55] group-hover:text-[#C76F53] transition-colors p-1 rounded-md hover:bg-[#262A2B]"
              title="Delete bookmark"
            >
              <MoreHorizontal className="w-[18px] h-[18px]" />
            </button>
          </div>

          <p className="text-[14px] text-[#A8A095] leading-relaxed line-clamp-2 mb-5 flex-1">
            {bm.description}
          </p>

          {bm.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-auto">
              {bm.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-medium px-3 py-1 rounded-full bg-[#262A2B] text-[#A8A095] cursor-pointer hover:bg-[#34383A] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery(tag);
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
