'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { conversationsService, Conversation } from '@/services/conversations.service';
import { Spinner } from '@/components/ui/Spinner';
import { useAuthStore as useAuth } from '@/store/auth.store';

function timeAgo(dateStr?: string) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function MessagesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return; }
    conversationsService.getAll()
      .then(setConversations)
      .finally(() => setLoading(false));
  }, []);

  const getOther = (conv: Conversation) =>
    conv.participants.find((p) => p._id !== user?._id) || conv.participants[0];

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">💬</p>
          <p className="font-medium">No conversations yet</p>
          <p className="text-sm mt-1">
            Accept a contact request to start chatting
          </p>
          <Link href="/contact-requests" className="inline-block mt-4 text-sm text-primary-600 hover:underline">
            View contact requests →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const other = getOther(conv);
            const initials = (other?.displayName || other?.username || '?')
              .split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
            return (
              <Link
                key={conv._id}
                href={`/messages/${conv._id}`}
                className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-semibold text-gray-900 text-sm">
                      {other?.displayName || other?.username}
                    </p>
                    <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {timeAgo(conv.lastMessageAt)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {conv.lastMessage?.content || 'Start a conversation'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
