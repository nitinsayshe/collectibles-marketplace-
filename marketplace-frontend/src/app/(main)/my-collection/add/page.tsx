'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { productsService } from '@/services/products.service';
import { CreateProductPayload, ProductCondition, ProductStatus } from '@/types/product.types';

const CATEGORIES = [
  'Die Cast', 'Scale Models', 'Action Figures', 'Trading Cards',
  'Coins', 'Watches', 'Stamps', 'Comics', 'Vintage Toys', 'Other',
];

const CONDITIONS: { value: ProductCondition; label: string }[] = [
  { value: 'new', label: 'New / Sealed' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const STATUSES: { value: ProductStatus; label: string }[] = [
  { value: 'collection_only', label: 'Collection Only (not for sale/trade)' },
  { value: 'for_sale', label: 'For Sale' },
  { value: 'for_trade', label: 'For Trade' },
];

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<CreateProductPayload>({
    title: '',
    description: '',
    category: '',
    brand: '',
    condition: 'new',
    status: 'collection_only',
    askingPrice: undefined,
    imageUrl: '',
  });

  const set = (key: keyof CreateProductPayload, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload: CreateProductPayload = {
        ...form,
        askingPrice: form.askingPrice ? Number(form.askingPrice) : undefined,
        imageUrl: form.imageUrl || undefined,
        description: form.description || undefined,
        brand: form.brand || undefined,
      };
      await productsService.create(payload);
      router.push('/');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add to collection</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Title *"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="e.g. BMW M3 E46 Mini GT 1:64"
          required
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Category *</label>
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <Input
          label="Brand"
          value={form.brand}
          onChange={(e) => set('brand', e.target.value)}
          placeholder="e.g. Mini GT, Hot Wheels"
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Condition</label>
          <select
            value={form.condition}
            onChange={(e) => set('condition', e.target.value as ProductCondition)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Availability</label>
          <select
            value={form.status}
            onChange={(e) => set('status', e.target.value as ProductStatus)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {form.status === 'for_sale' && (
          <Input
            label="Asking Price (₹)"
            type="number"
            min={0}
            value={form.askingPrice ?? ''}
            onChange={(e) => set('askingPrice', e.target.value)}
            placeholder="e.g. 2500"
          />
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            placeholder="Condition details, scale, edition..."
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        <ImageUpload
          label="Image"
          value={form.imageUrl}
          onChange={(url) => set('imageUrl', url)}
        />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={loading} className="flex-1">
            Add to collection
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
