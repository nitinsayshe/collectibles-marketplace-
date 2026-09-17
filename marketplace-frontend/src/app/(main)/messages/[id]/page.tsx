'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { conversationsService, Message } from '@/services/conversations.service';
import { getSocket } from '@/lib/socket';
import { Spinner } from '@/components/ui/Spinner';

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<{ username: string; displayName: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!isAuthenticated() || !token) { router.push('/login'); return; }

    // Load messages
    conversationsService.getMessages(id)
      .then((msgs) => {
        setMessages(msgs);
        setLoading(false);
      })
      .catch(() => { router.push('/messages'); });

    // Load conversation info (to get other participant name)
    conversationsService.getAll().then((convs) => {
      const conv = convs.find((c) => c._id === id);
      if (conv) {
        const other = conv.participants.find((p) => p._id !== user?._id);
        if (other) setOtherUser(other);
      }
    });

    // Connect socket
    const socket = getSocket(token);
    socketRef.current = socket;
    socket.emit('join-conversation', { conversationId: id });

    socket.on('new-message', (msg: Message) => {
      setMessages((prev) => {
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socket.off('new-message');
      socket.emit('leave-conversation', { conversationId: id });
    };
  }, [id, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const content = input.trim();
    if (!content) return;
    setInput('');
    socketRef.current?.emit('send-message', { conversationId: id, content });
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => router.push('/messages')} className="text-gray-500 hover:text-gray-800 mr-1">←</button>
        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
          {(otherUser?.displayName || otherUser?.username || '?')[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{otherUser?.displayName || otherUser?.username || '...'}</p>
          <p className="text-xs text-gray-400">@{otherUser?.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            <p className="text-3xl mb-2">👋</p>
            <p className="text-sm">Say hello to start the conversation</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender._id === user?._id;
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-primary-600 text-white rounded-br-sm'
                        : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <p className="text-xs text-gray-400 px-1">{formatTime(msg.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 flex items-end gap-3 flex-shrink-0">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 max-h-32"
          style={{ overflowY: input.split('\n').length > 3 ? 'auto' : 'hidden' }}
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          Send
        </button>
      </div>
    </div>
  );
}
