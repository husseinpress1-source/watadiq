export type BlogPostListItem = {
  id: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  coverImage: string | null;
  readingTimeMin: number;
  authorName: string;
  tags: string[];
  titleEn: string;
  titleAr: string;
  excerptEn: string;
  excerptAr: string;
  updatedAt: string;
};

export type BlogPost = BlogPostListItem & {
  bodyEn: string;
  bodyAr: string;
};

export function blogTitle(post: BlogPostListItem, lang: string) {
  return lang.startsWith('ar') ? post.titleAr : post.titleEn;
}

export function blogExcerpt(post: BlogPostListItem, lang: string) {
  return lang.startsWith('ar') ? post.excerptAr : post.excerptEn;
}

export function blogBody(post: BlogPost, lang: string) {
  return lang.startsWith('ar') ? post.bodyAr : post.bodyEn;
}
