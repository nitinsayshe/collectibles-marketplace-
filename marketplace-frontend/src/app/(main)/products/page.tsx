'use client';

import { useEffect, useState, useMemo } from 'react';
import { productsService } from '@/services/products.service';
import { ProductCard } from '@/components/products/ProductCard';
import { Product, ProductStatus } from '@/types/product.types';
import { Spinner } from '@/components/ui/Spinner';

const CATEGORIES = [
  'All', 'Die Cast', 'Scale Models', 'Action Figures', 'Trading Cards',
  'Coins', 'Watches', 'Stamps', 'Comics', 'Vintage Toys', 'Other',
];

const STATUS_FILTERS: { label: string; value: ProductStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'For Sale', value: 'for_sale' },
  { label: 'For Trade', value: 'for_trade' },
  { label: 'Collection', value: 'collection_only' },
];

export default function BrowsePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState<ProductStatus | 'all'>('all');

  useEffect(() => {
    productsService.getAll()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.brand?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'All' || p.category === category;
      const matchStatus = status === 'all' || p.status === status;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, search, category, status]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Browse Collectibles</h1>

      {/* Search */}
      <div className="relative mb-5">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
        <input
          type="text"
          placeholder="Search by title, brand, description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatus(s.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              status === s.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Category pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              category === c
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">No collectibles found</p>
          <p className="text-sm mt-1">Try a different search or filter</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </>
      )}
    </div>
  );
}
