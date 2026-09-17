'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { contactRequestsService } from '@/services/contact-requests.service';

export function Navbar() {
  const router = useRouter();
  const { user, logout, isAuthenticated, token } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isAuthenticated()) return;
    contactRequestsService.getIncoming()
      .then((reqs) => setPendingCount(reqs.length))
      .catch(() => {});
  }, [mounted, token]);

  const handleLogout = async () => {
    try { await authService.logout(); } finally {
      logout();
      router.push('/');
    }
  };

  const loggedIn = mounted && isAuthenticated();

  return (
    <header className="bg-gray-900 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span className="text-primary-400">◆</span> Collectibles
        </Link>

        <div className="flex items-center gap-5">
          <Link href="/products" className="text-sm text-gray-300 hover:text-white transition-colors">Browse</Link>
          <Link href="/collectors" className="text-sm text-gray-300 hover:text-white transition-colors">Collectors</Link>

          {loggedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/my-collection" className="text-sm text-gray-300 hover:text-white transition-colors">
                My Collection
              </Link>

              <Link href="/messages" className="text-sm text-gray-300 hover:text-white transition-colors">
                Messages
              </Link>

              {/* Contact requests bell */}
              <Link href="/contact-requests" className="relative text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                    {pendingCount}
                  </span>
                )}
              </Link>

              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm hover:ring-2 hover:ring-primary-400 transition-all"
                  title="My Profile"
                >
                  {(user?.displayName || user?.username || '?')[0].toUpperCase()}
                </Link>
                <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-200 transition-colors">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors">Sign in</Link>
              <Link
                href="/signup"
                className="text-sm px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
