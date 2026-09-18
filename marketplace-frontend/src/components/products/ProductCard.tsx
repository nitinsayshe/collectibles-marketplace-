import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product.types';

export const statusLabel: Record<string, string> = {
  for_sale: 'For Sale',
  for_trade: 'For Trade',
  collection_only: 'Collection',
  hidden: 'Hidden',
};

export const statusColor: Record<string, string> = {
  for_sale: 'bg-green-100 text-green-700',
  for_trade: 'bg-blue-100 text-blue-700',
  collection_only: 'bg-gray-100 text-gray-600',
  hidden: 'bg-yellow-100 text-yellow-700',
};

interface ProductCardProps {
  product: Product;
  onDelete?: (id: string) => void;
  onToggleHide?: (id: string, currentStatus: string) => void;
  onEdit?: (id: string) => void;
}

export function ProductCard({ product, onDelete, onToggleHide, onEdit }: ProductCardProps) {
  const isOwner = !!(onDelete || onToggleHide || onEdit);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow relative group flex flex-col">
      <Link href={`/products/${product._id}`} className="block">
        <div className="aspect-square bg-gray-100 relative">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">
              📦
            </div>
          )}
          {product.status === 'hidden' && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <span className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded-full">Hidden</span>
            </div>
          )}
        </div>

        <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
              {product.title}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0 ${statusColor[product.status]}`}>
              {statusLabel[product.status]}
            </span>
          </div>

          {product.category && (
            <p className="text-xs text-gray-400 mb-1">{product.category}{product.brand ? ` · ${product.brand}` : ''}</p>
          )}

          {product.askingPrice != null && product.status === 'for_sale' && (
            <p className="text-sm font-bold text-gray-900">₹{product.askingPrice.toLocaleString()}</p>
          )}

          {!isOwner && product.owner && (
            <p className="text-xs text-gray-400 mt-2 truncate">
              {product.owner.displayName || product.owner.username}
            </p>
          )}
        </div>
      </Link>

      {/* Owner action bar */}
      {isOwner && (
        <div className="flex border-t border-gray-100 divide-x divide-gray-100 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(product._id)}
              className="flex-1 py-2 text-xs text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors flex items-center justify-center gap-1"
              title="Edit"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}
          {onToggleHide && (
            <button
              onClick={() => onToggleHide(product._id, product.status)}
              className="flex-1 py-2 text-xs text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 transition-colors flex items-center justify-center gap-1"
              title={product.status === 'hidden' ? 'Show' : 'Hide'}
            >
              {product.status === 'hidden' ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Show
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  Hide
                </>
              )}
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(product._id)}
              className="flex-1 py-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
              title="Delete"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
