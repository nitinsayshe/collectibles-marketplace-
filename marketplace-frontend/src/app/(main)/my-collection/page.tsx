'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { productsService } from '@/services/products.service';
import { ProductCard } from '@/components/products/ProductCard';
import { Product } from '@/types/product.types';
import { Spinner } from '@/components/ui/Spinner';

export default function MyCollectionPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return; }
    productsService.getMine()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = (id: string) => {
    router.push(`/my-collection/${id}/edit`);
  };

  const handleToggleHide = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'hidden' ? 'collection_only' : 'hidden';
    const updated = await productsService.update(id, { status: newStatus as any });
    setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, status: updated.status } : p)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this item from your collection?')) return;
    await productsService.remove(id);
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  const visible = products.filter((p) => p.status !== 'hidden').length;
  const hidden = products.filter((p) => p.status === 'hidden').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Collection</h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-0.5">
              {products.length} item{products.length !== 1 ? 's' : ''}
              {hidden > 0 && <span className="ml-1 text-yellow-600">· {hidden} hidden</span>}
            </p>
          )}
        </div>
        <Link
          href="/my-collection/add"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          + Add item
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-lg font-medium text-gray-600">Your collection is empty</p>
          <p className="text-sm mt-1 mb-6">Start adding the collectibles you own</p>
          <Link
            href="/my-collection/add"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            Add your first item
          </Link>
        </div>
      ) : (
        <>
          {hidden > 0 && (
            <div className="mb-4 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
              {hidden} item{hidden !== 1 ? 's are' : ' is'} hidden and not visible to other collectors.
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                onEdit={handleEdit}
                onToggleHide={handleToggleHide}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
