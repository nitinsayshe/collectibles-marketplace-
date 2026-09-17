import Link from 'next/link';
import { User } from '@/types/user.types';

interface CollectorCardProps {
  user: User;
}

export function CollectorCard({ user }: CollectorCardProps) {
  const initials = (user.displayName || user.username || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={`/collectors/${user._id}`}>
      <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col items-center text-center gap-3">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">
            {user.displayName || user.username}
          </p>
          <p className="text-xs text-gray-400">@{user.username}</p>
        </div>
        {user.bio && (
          <p className="text-xs text-gray-500 line-clamp-2">{user.bio}</p>
        )}
        <span className="text-xs text-primary-600 font-medium">View collection →</span>
      </div>
    </Link>
  );
}
