import type { ReactNode } from "react";

export type ProfileCardFeaturedArticle = {
  title: string;
  href: string;
};

export type ProfileCardData = {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  bio?: string | null;
  techStack: string[];
  followerCount?: number;
  followingCount?: number;
  featuredArticles?: ProfileCardFeaturedArticle[];
};

export type BlogPostCardData = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  description?: string | null;
  publishedAt: string | null;
  updatedAt?: string | null;
  authorName: string;
  authorUsername?: string | null;
  authorAvatarUrl?: string | null;
  tags: string[];
  views: number;
  reactions: number;
  comments: number;
  readTimeMinutes?: number | null;
  isFeatured?: boolean;
};

export type DiscussionCardData = {
  id: string;
  slug: string;
  title: string;
  body?: string | null;
  createdAt: string;
  authorAvatarUrl?: string | null;
  authorUsername: string;
  tags: string[];
  commentCount: number;
  reactionCount: number;
};

export type CardHeaderSlot = ReactNode;
export type CardFooterSlot = ReactNode;

