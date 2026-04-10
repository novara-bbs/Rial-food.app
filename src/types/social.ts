export interface PostAuthor {
  id?: string;
  name: string;
  img: string;
  role: string;
  time: string;
  verified?: boolean;
}

export interface PostComment {
  id: number;
  author: string;
  authorId?: string;
  authorImg?: string;
  text: string;
  time: string;
  likes?: number;
}

export interface CommunityPost {
  id: number;
  author: PostAuthor;
  content: string;
  images?: string[];
  type: 'text' | 'performance' | 'recipe' | 'repost';
  performance?: { recovery: number; strain: number };
  recipe?: {
    id?: string;
    title: string;
    cal: number;
    pro: number;
    carbs?: number;
    fats?: number;
    time: string;
    img: string;
    tag: string;
  };
  repostOf?: number;
  hashtags?: string[];
  likes: number;
  comments: number;
  saves: number;
  commentsList: PostComment[];
  createdAt?: string;
}

export interface Story {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  slides: StorySlide[];
  createdAt: string;
  expiresAt: string;
  viewedBy: string[];
}

export interface StorySlide {
  id: string;
  type: 'text' | 'performance' | 'recipe' | 'image';
  content?: string;
  backgroundColor?: string;
  image?: string;
  performance?: { recovery: number; strain: number };
  recipe?: { id: string; title: string; img: string; cal: number; pro: number };
}

export interface SocialLinks {
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'repost' | 'recipe_save' | 'challenge';
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  targetId?: string;
  targetPreview?: string;
  read: boolean;
  createdAt: string;
}
