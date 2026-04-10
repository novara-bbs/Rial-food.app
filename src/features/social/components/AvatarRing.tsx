import { Plus } from 'lucide-react';

interface AvatarRingProps {
  src: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  hasStory?: boolean;
  storyViewed?: boolean;
  showPlus?: boolean;
  onClick?: () => void;
}

const sizeMap = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-20 h-20',
};

export default function AvatarRing({ src, name, size = 'md', hasStory, storyViewed, showPlus, onClick }: AvatarRingProps) {
  const ring = hasStory && !storyViewed
    ? 'bg-gradient-to-tr from-primary to-secondary'
    : 'bg-surface-container-highest';

  return (
    <div className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group" onClick={onClick}>
      <div className={`relative p-1 rounded-full transition-all duration-300 group-hover:scale-105 ${ring}`}>
        <div className="bg-background p-0.5 rounded-full">
          <img
            src={src}
            alt={name}
            className={`${sizeMap[size]} rounded-full object-cover grayscale group-hover:grayscale-0 transition-all`}
            referrerPolicy="no-referrer"
          />
        </div>
        {showPlus && (
          <div className="absolute bottom-0 right-0 bg-primary text-on-primary rounded-full p-1 border-2 border-background">
            <Plus className="w-3 h-3" />
          </div>
        )}
      </div>
      <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase group-hover:text-primary transition-colors max-w-[70px] truncate text-center">
        {name}
      </span>
    </div>
  );
}
