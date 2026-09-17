'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { contactRequestsService, ContactRequest } from '@/services/contact-requests.service';
import { Spinner } from '@/components/ui/Spinner';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ContactRequestsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [incoming, setIncoming] = useState<ContactRequest[]>([]);
  const [outgoing, setOutgoing] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return; }
    Promise.all([
      contactRequestsService.getIncoming(),
      contactRequestsService.getOutgoing(),
    ]).then(([inc, out]) => {
      setIncoming(inc);
      setOutgoing(out);
    }).finally(() => setLoading(false));
  }, []);

  const handleAccept = async (req: ContactRequest) => {
    const { conversationId } = await contactRequestsService.accept(req._id);
    setIncoming((prev) => prev.filter((r) => r._id !== req._id));
    router.push(`/messages/${conversationId}`);
  };

  const handleReject = async (id: string) => {
    await contactRequestsService.reject(id);
    setIncoming((prev) => prev.filter((r) => r._id !== id));
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-600',
    };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${map[status]}`}>{status}</span>;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Contact Requests</h1>

      <div className="flex border-b border-gray-200 mb-6">
        {(['incoming', 'outgoing'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t}
            {t === 'incoming' && incoming.length > 0 && (
              <span className="ml-2 bg-primary-600 text-white text-xs rounded-full px-1.5 py-0.5">
                {incoming.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : tab === 'incoming' ? (
        incoming.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-3xl mb-3">📬</p>
            <p className="font-medium">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {incoming.map((req) => (
              <div key={req._id} className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {req.sender.displayName || req.sender.username}
                    </p>
                    <p className="text-xs text-gray-400">@{req.sender.username} · {timeAgo(req.createdAt)}</p>
                  </div>
                </div>
                {req.message && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2 mb-3 italic">
                    "{req.message}"
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(req)}
                    className="flex-1 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Accept & Chat
                  </button>
                  <button
                    onClick={() => handleReject(req._id)}
                    className="flex-1 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        outgoing.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-3xl mb-3">📤</p>
            <p className="font-medium">No outgoing requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {outgoing.map((req) => (
              <div key={req._id} className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {req.receiver.displayName || req.receiver.username}
                    </p>
                    <p className="text-xs text-gray-400">@{req.receiver.username} · {timeAgo(req.createdAt)}</p>
                  </div>
                  {statusBadge(req.status)}
                </div>
                {req.message && (
                  <p className="text-sm text-gray-500 mt-2 italic">"{req.message}"</p>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
