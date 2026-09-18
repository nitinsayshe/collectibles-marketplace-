'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { contactRequestsService } from '@/services/contact-requests.service';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated, token } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isAuthenticated()) return;
    contactRequestsService.getIncoming()
      .then((reqs) => setPendingCount(reqs.length))
      .catch(() => {});
  }, [mounted, token]);

  // Close the mobile menu on every route change (link taps, back/forward, programmatic nav)
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try { await authService.logout(); } finally {
      logout();
      router.push('/');
    }
  };

  const loggedIn = mounted && isAuthenticated();

  const bell = (
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
  );

  return (
    <header className="bg-gray-900 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span className="text-primary-400">◆</span> Collectibles
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-5">
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

              {bell}

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

        {/* Mobile: bell (if logged in) + hamburger toggle */}
        <div className="flex items-center gap-4 lg:hidden">
          {loggedIn && bell}
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="text-gray-300 hover:text-white p-1 -mr-1"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="lg:hidden border-t border-gray-800 px-4 sm:px-6 py-3 space-y-1">
          <Link href="/products" className="block px-2 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
            Browse
          </Link>
          <Link href="/collectors" className="block px-2 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
            Collectors
          </Link>

          {loggedIn ? (
            <>
              <Link href="/my-collection" className="block px-2 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                My Collection
              </Link>
              <Link href="/messages" className="block px-2 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                Messages
              </Link>
              <Link href="/profile" className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                <span className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {(user?.displayName || user?.username || '?')[0].toUpperCase()}
                </span>
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-2 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block px-2 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="block px-2 py-2.5 mt-1 rounded-lg text-sm text-center bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
