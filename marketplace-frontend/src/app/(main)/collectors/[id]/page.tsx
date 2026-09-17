'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usersService } from '@/services/users.service';
import { productsService } from '@/services/products.service';
import { ProductCard } from '@/components/products/ProductCard';
import { User } from '@/types/user.types';
import { Product } from '@/types/product.types';
import { Spinner } from '@/components/ui/Spinner';
import Image from 'next/image';

export default function CollectorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([
      usersService.getProfile(id),
      productsService.getAll({ owner: id }),
    ])
      .then(([u, p]) => { setUser(u); setProducts(p); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;

  if (notFound || !user) return (
    <div className="text-center py-32 text-gray-400">
      <p className="text-4xl mb-3">👤</p>
      <p className="font-medium">Collector not found</p>
      <button onClick={() => router.back()} className="mt-4 text-sm text-primary-600 hover:underline">Go back</button>
    </div>
  );

  const initials = (user.displayName || user.username)
    .split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const forSale = products.filter((p) => p.status === 'for_sale').length;
  const forTrade = products.filter((p) => p.status === 'for_trade').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800 mb-6">← Back</button>

      {/* Profile header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {user.avatarUrl ? (
              <div className="w-20 h-20 rounded-full overflow-hidden relative">
                <Image src={user.avatarUrl} alt="avatar" fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl">
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl font-bold text-gray-900">{user.displayName || user.username}</h1>
            <p className="text-sm text-gray-400 mb-2">@{user.username}</p>
            {user.bio && <p className="text-sm text-gray-600 mb-3">{user.bio}</p>}

            {/* Contact details row */}
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start text-sm text-gray-500 mb-3">
              {user.city && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {user.city}
                </span>
              )}
              {user.instagram && (
                <a
                  href={`https://instagram.com/${user.instagram.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-pink-500 hover:text-pink-600"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  @{user.instagram.replace(/^@/, '')}
                </a>
              )}
            </div>

            <div className="flex gap-4 justify-center sm:justify-start text-sm">
              <span><strong>{products.length}</strong> <span className="text-gray-500">items</span></span>
              {forSale > 0 && <span><strong>{forSale}</strong> <span className="text-gray-500">for sale</span></span>}
              {forTrade > 0 && <span><strong>{forTrade}</strong> <span className="text-gray-500">for trade</span></span>}
            </div>
          </div>
        </div>
      </div>

      {/* Collection */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Collection</h2>
      {products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📦</p>
          <p>No items in this collection yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
