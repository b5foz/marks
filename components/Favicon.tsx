import React, { useState } from 'react';

interface FaviconProps {
  url: string;
  title: string;
}

export default function Favicon({ url, title }: FaviconProps) {
  const [error, setError] = useState(false);

  const getDomain = (urlString: string) => {
    try {
      const domain = new URL(urlString).hostname;
      return domain.replace(/^www\./, '');
    } catch {
      return urlString;
    }
  };

  const domain = getDomain(url);
  const initial = title.charAt(0).toUpperCase();

  if (error || !url) {
    return (
      <div className="w-10 h-10 rounded-lg bg-[#262A2B] flex items-center justify-center text-sm font-medium text-[#EBE7E0] shadow-sm flex-shrink-0">
        {initial}
      </div>
    );
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt={title}
      className="w-10 h-10 rounded-lg object-cover bg-[#262A2B] flex-shrink-0 shadow-sm"
      onError={() => setError(true)}
    />
  );
}
