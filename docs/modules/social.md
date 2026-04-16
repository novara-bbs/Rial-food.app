# Module: Social

> Community feed, posts, stories, creator profiles, challenges, and notifications.

## Why it exists

RIAL differentiates from pure tracking apps by adding a social layer. Users share progress, recipes, and performance posts. Creators build an audience around nutrition content. Challenges drive engagement and retention. The social module serves all ICPs but is particularly relevant for community-oriented users and potential creator economy monetization.

## Screens

| Screen | File | Nav route | Purpose |
|--------|------|-----------|---------|
| Community | `screens/Community.tsx` | `community` | Main feed with For You / Following / Trending tabs |
| Creadores | `screens/Creadores.tsx` | `creadores` | Creator directory and discovery |
| CreatePost | `screens/CreatePost.tsx` | `create-post` | Publish text, performance, recipe, or progress post |
| CreateStory | `screens/CreateStory.tsx` | `create-story` | Create multi-slide story |
| PostDetail | `screens/PostDetail.tsx` | `post-detail` | Full post with comments |
| StoryViewer | `screens/StoryViewer.tsx` | `story-viewer` | Full-screen story playback |
| Challenges | `screens/Challenges.tsx` | `challenges` | Community challenges list |
| ChallengeDetail | `screens/ChallengeDetail.tsx` | `challenge-detail` | Challenge leaderboard and join flow |
| Notifications | `screens/Notifications.tsx` | `notifications` | Engagement notifications |
| CreatorProfile | `screens/CreatorProfile.tsx` | `creator-profile` | Creator bio, recipes, social links |
| CreatorDashboard | `screens/CreatorDashboard.tsx` | `creator-dashboard` | Creator stats (followers, engagement) |
| CreatorVerification | `screens/CreatorVerification.tsx` | `creator-verification` | Verification badge application |

## Components

| Component | File | Used by |
|-----------|------|---------|
| PostCard | `components/PostCard.tsx` | Community feed — post preview |
| ProgressPostCard | `components/ProgressPostCard.tsx` | Community — weight milestone posts |
| PostComment | `components/PostComment.tsx` | PostDetail — comment display |
| FeedTabs | `components/FeedTabs.tsx` | Community — tab switcher |
| AvatarRing | `components/AvatarRing.tsx` | Story rings, creator profiles |
| StoryRingsRow | `components/StoryRingsRow.tsx` | Community — horizontal story scroll |
| PublishRecipeSheet | `components/PublishRecipeSheet.tsx` | RecipeDetail — publish to community |
| ImagePicker | `components/ImagePicker.tsx` | CreatePost, CreateStory — upload images |
| ShareSheet | `components/ShareSheet.tsx` | PostDetail — share options |

## Handlers

| Export | File | Pure? | Purpose |
|--------|------|-------|---------|
| `createHandleCreatePost` | `handlers/social-handlers.ts` | Yes (factory) | Publish post (text/recipe/performance/progress) |
| `createHandleAddComment` | `handlers/social-handlers.ts` | Yes (factory) | Add comment to post |
| `createHandlePublishStory` | `handlers/story-handlers.ts` | Yes (factory) | Publish multi-slide story |
| `createHandleMarkStoryViewed` | `handlers/story-handlers.ts` | Yes (factory) | Track story views |

## Utils

| Export | File | Pure? | Purpose |
|--------|------|-------|---------|
| `scoreFeedItem` | `utils/feed-algorithm.ts` | Yes | Weighted scoring: social proof 30%, recency 25%, affinity 25%, content match 20% |
| `rankFeed` | `utils/feed-algorithm.ts` | Yes | Sort feed by composite score |
| `getFollowingFeed` | `utils/feed-algorithm.ts` | Yes | Filter to followed creators |
| `getTrendingFeed` | `utils/feed-algorithm.ts` | Yes | Top posts from last 7 days |
| `compressImage` | `utils/image-utils.ts` | Yes | Image compression for upload |
| `estimateStorageUsage` | `utils/image-utils.ts` | Yes | Estimate localStorage usage |

## Data

| File | Contents |
|------|----------|
| `data/seed-posts.ts` | Demo community posts |
| `data/seed-stories.ts` | Demo stories with slides |
| `data/seed-creators.ts` | Demo creator profiles |

## Data flow

- `communityPosts` in AppStateContext: array of `CommunityPost` objects.
- `stories` in AppStateContext: array of `Story` objects with slides and expiration.
- `viewedStories`, `followers`, `followedCreators` track social graph state.
- `notifications` stores engagement events (likes, comments, follows).
- All data is currently localStorage-only — no real social backend.

## Cross-dependencies

### Imports from other modules
- `features/recipes/` — recipe data for recipe posts
- `features/wellness/` — weight data for progress posts
- `contexts/AppStateContext.tsx` — all state
- `components/` — shared UI primitives

### Exports to other modules
- `image-utils.ts` — used by LogSnapshotModal for photo compression
- Post/story data consumed by Home (Discover screen)

## Known issues

- All social data is local-only — no real server-backed social features
- Challenges/Creadores card divs have nested onClick (a11y issue requiring restructure)
- Stories don't auto-expire (24h TTL not enforced)
- Feed algorithm operates on local data only
- No content moderation or reporting system

## Improvement opportunities

- Supabase-backed social features (posts, comments, follows)
- Real-time notifications via Supabase Realtime
- Content moderation pipeline
- Creator monetization (sponsored content, recipe sales)
- Challenge rewards and badge integration with gamification
- Story auto-expiration enforcement
