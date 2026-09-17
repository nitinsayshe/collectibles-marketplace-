'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { productsService } from '@/services/products.service';
import { ProductCard } from '@/components/products/ProductCard';
import { Product } from '@/types/product.types';
import { Spinner } from '@/components/ui/Spinner';

const FEATURES = [
  { icon: '🏷️', label: 'List & sell your items' },
  { icon: '🔄', label: 'Trade with collectors' },
  { icon: '💬', label: 'Chat in real time' },
  { icon: '🔍', label: 'Discover rare finds' },
];

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    productsService.getAll()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const loggedIn = mounted && isAuthenticated();

  return (
    <div>
      {/* Hero — guests only */}
      {!loggedIn && (
        <div className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-primary-500/20 text-primary-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-primary-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
              Community marketplace for collectors
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-5 tracking-tight">
              Discover.{' '}
              <span className="text-primary-400">Collect.</span>{' '}
              Trade.
            </h1>
            <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
              The marketplace built for serious collectors. Browse rare finds, connect with other enthusiasts, and grow your collection.
            </p>
            <div className="flex justify-center gap-3 mb-12">
              <Link
                href="/signup"
                className="px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors"
              >
                Start collecting free
              </Link>
              <Link
                href="/products"
                className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/10"
              >
                Browse items →
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {FEATURES.map((f) => (
                <div key={f.label} className="flex items-center gap-2 text-sm text-gray-400">
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Logged-in header */}
        {loggedIn && (
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Latest Collectibles</h2>
            <Link
              href="/my-collection/add"
              className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              + Add to collection
            </Link>
          </div>
        )}

        {!loggedIn && products.length > 0 && (
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Collectibles</h2>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">📦</p>
            <p className="text-lg font-medium">No collectibles yet</p>
            {loggedIn && (
              <p className="text-sm mt-1">
                Be the first —{' '}
                <Link href="/my-collection/add" className="text-primary-600 hover:underline">
                  add something to your collection
                </Link>
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
