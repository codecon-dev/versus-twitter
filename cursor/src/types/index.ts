export type Author = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type Post = {
  id: string;
  content: string;
  mediaUrl: string | null;
  createdAt: string;
  author: Author;
  retweetOf?: {
    id: string;
    content: string;
    mediaUrl: string | null;
    author: Author;
  } | null;
  _count: { likes: number; retweets?: number };
  liked?: boolean;
  bookmarked?: boolean;
};

export type User = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
};
