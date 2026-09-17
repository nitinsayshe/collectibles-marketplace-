'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { productsService } from '@/services/products.service';
import { contactRequestsService, ContactStatus } from '@/services/contact-requests.service';
import { useAuthStore } from '@/store/auth.store';
import { Product } from '@/types/product.types';
import { Spinner } from '@/components/ui/Spinner';
import { statusLabel, statusColor } from '@/components/products/ProductCard';

const conditionLabel: Record<string, string> = {
  new: 'New / Sealed',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [contactStatus, setContactStatus] = useState<ContactStatus>({ status: 'none' });
  const [showModal, setShowModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    productsService.getOne(id)
      .then((p) => {
        setProduct(p);
        if (isAuthenticated() && p.owner._id !== user?._id) {
          contactRequestsService.getStatus(p.owner._id).then(setContactStatus).catch(() => {});
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSendRequest = async () => {
    if (!product) return;
    setSending(true);
    try {
      await contactRequestsService.send(product.owner._id, requestMessage);
      setContactStatus({ status: 'pending', isSender: true });
      setShowModal(false);
      setRequestMessage('');
    } finally {
      setSending(false);
    }
  };

  const contactButton = () => {
    if (!isAuthenticated()) {
      return (
        <Link href="/login" className="w-full block text-center py-3 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700">
          Sign in to contact
        </Link>
      );
    }
    if (!product || product.owner._id === user?._id) return null;

    if (contactStatus.status === 'accepted') {
      return (
        <Link href="/messages" className="w-full block text-center py-3 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
          💬 Open Chat
        </Link>
      );
    }
    if (contactStatus.status === 'pending') {
      return (
        <button disabled className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl text-sm font-medium cursor-not-allowed">
          {contactStatus.isSender ? 'Request Sent — Awaiting Response' : 'They Sent You a Request'}
        </button>
      );
    }
    return (
      <button
        onClick={() => setShowModal(true)}
        className="w-full py-3 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
      >
        Contact Collector
      </button>
    );
  };

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (notFound || !product) return (
    <div className="text-center py-32 text-gray-400">
      <p className="text-4xl mb-3">📦</p>
      <p className="font-medium text-lg">Product not found</p>
      <button onClick={() => router.back()} className="mt-4 text-sm text-primary-600 hover:underline">Go back</button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800 mb-6">← Back</button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.title} fill className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-7xl">📦</div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[product.status]}`}>
                {statusLabel[product.status]}
              </span>
              {product.condition && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                  {conditionLabel[product.condition] || product.condition}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{product.title}</h1>
            <p className="text-sm text-gray-500">{product.category}{product.brand ? ` · ${product.brand}` : ''}</p>
          </div>

          {product.status === 'for_sale' && product.askingPrice != null && (
            <p className="text-3xl font-bold text-gray-900">₹{product.askingPrice.toLocaleString()}</p>
          )}

          {product.status === 'for_trade' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm font-medium text-blue-800">Available for trade</p>
              <p className="text-xs text-blue-600 mt-0.5">Contact the collector to discuss</p>
            </div>
          )}

          {product.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {product.owner && (
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-medium">Collector</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{product.owner.displayName || product.owner.username}</p>
                  <p className="text-xs text-gray-400">@{product.owner.username}</p>
                </div>
                <Link href={`/collectors/${product.owner._id}`} className="text-xs text-primary-600 hover:underline font-medium">
                  View collection →
                </Link>
              </div>
            </div>
          )}

          {contactButton()}
        </div>
      </div>

      {/* Contact Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Contact Collector</h3>
            <p className="text-sm text-gray-500 mb-4">
              Send a request to {product.owner?.displayName || product.owner?.username}. They can accept or decline.
            </p>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder={`Hi! I'm interested in your ${product.title}...`}
              rows={4}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSendRequest}
                disabled={sending}
                className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-60 transition-colors"
              >
                {sending ? 'Sending...' : 'Send Request'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
