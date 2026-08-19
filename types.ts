export interface BookmarkType {
  id: string;
  title: string;
  url: string;
  description: string;
  collection: string;
  category: string;
  tags: string[];
}

export interface Collection {
  name: string;
  count: number;
  color?: string;
}
