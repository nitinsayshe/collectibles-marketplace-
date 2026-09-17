'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { productsService } from '@/services/products.service';
import { UpdateProductPayload, ProductCondition, ProductStatus } from '@/types/product.types';

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

const STATUSES: { value: ProductStatus; label: string; description: string }[] = [
  { value: 'collection_only', label: 'Collection Only', description: 'Visible but not for sale or trade' },
  { value: 'for_sale', label: 'For Sale', description: 'Listed with an asking price' },
  { value: 'for_trade', label: 'For Trade', description: 'Open to trade offers' },
  { value: 'hidden', label: 'Hidden', description: 'Only visible to you' },
];

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<UpdateProductPayload>({
    title: '',
    description: '',
    category: '',
    brand: '',
    condition: 'new',
    status: 'collection_only',
    askingPrice: undefined,
    imageUrl: '',
  });

  useEffect(() => {
    productsService.getOne(id)
      .then((p) => {
        setForm({
          title: p.title || '',
          description: p.description || '',
          category: p.category || '',
          brand: p.brand || '',
          condition: p.condition || 'new',
          status: p.status || 'collection_only',
          askingPrice: p.askingPrice,
          imageUrl: p.imageUrl || '',
        });
      })
      .catch(() => router.push('/my-collection'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (key: keyof UpdateProductPayload, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload: UpdateProductPayload = {
        ...form,
        askingPrice: form.askingPrice ? Number(form.askingPrice) : undefined,
        imageUrl: form.imageUrl || undefined,
        description: form.description || undefined,
        brand: form.brand || undefined,
      };
      await productsService.update(id, payload);
      router.push('/my-collection');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-32"><Spinner size="lg" /></div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800 mb-6">
        ← Back
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit item</h1>

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

        {/* Availability — card-style selector */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Availability</label>
          <div className="grid grid-cols-2 gap-2">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => set('status', s.value)}
                className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                  form.status === s.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <p className="font-medium">{s.label}</p>
                <p className={`text-xs mt-0.5 ${form.status === s.value ? 'text-primary-500' : 'text-gray-400'}`}>
                  {s.description}
                </p>
              </button>
            ))}
          </div>
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
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={saving} className="flex-1">
            Save changes
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
