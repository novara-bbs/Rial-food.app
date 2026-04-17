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

export interface ProgressPostPayload {
  /** `snapshot` = one-off share of a BodySnapshot; `milestone` = auto-prompted when crossing ±1kg */
  kind: 'snapshot' | 'milestone';
  currentKg: number;
  /** kg delta vs reference point (positive or negative). Omit on first share. */
  deltaKg?: number;
  /** YYYY-MM-DD of the reference snapshot used to compute delta. */
  sinceDate?: string;
  /** Inline base64 photo from the BodySnapshot (optional). */
  photoUrl?: string;
}

export interface CommunityPost {
  id: number;
  author: PostAuthor;
  content: string;
  images?: string[];
  type: 'text' | 'performance' | 'recipe' | 'repost' | 'progress';
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
    photos?: string[];
  };
  progress?: ProgressPostPayload;
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
