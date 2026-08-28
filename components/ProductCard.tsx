'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/supabase';
import { useCart } from '@/lib/cart-context';
import { usePowerEditor } from '@/lib/power-editor-context';

export default function ProductCard({ product: initialProduct }: { product: Product }) {
  const { addItem } = useCart();
  const { editMode } = usePowerEditor();
  const [product, setProduct] = useState(initialProduct);
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceDraft, setPriceDraft] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSale = product.compare_at_price && product.compare_at_price > product.price;
  const outOfStock = product.stock <= 0;
  const primaryImage = product.images?.[0];
  const hoverImage = product.images?.[1] || primaryImage;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      handle: product.handle,
      title: product.title,
      price: product.price,
      image: product.images?.[0] || '',
    });
  }

  async function savePrice(e?: React.SyntheticEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    const newPrice = Number(priceDraft);
    if (!isNaN(newPrice)) {
      await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: newPrice }),
      });
      setProduct((p) => ({ ...p, price: newPrice }));
    }
    setEditingPrice(false);
  }

  async function handleImageReplace(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    if (res.ok) {
      const data = await res.json();
      const newImages = [data.url, ...(product.images || []).slice(1)];
      await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: newImages }),
      });
      setProduct((p) => ({ ...p, images: newImages }));
    }
    setUploading(false);
    e.target.value = '';
  }

  return (
    <Link
      href={`/products/${product.handle}`}
      onClick={(e) => {
        if (editMode) e.preventDefault();
      }}
      className="card rounded-xl overflow-hidden group relative block transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/60"
    >
      <div className="relative aspect-square bg-neutral-900 overflow-hidden">
        {primaryImage && (
          <Image
            src={primaryImage}
            alt={product.title}
            fill
            className={`object-cover transition-all duration-500 ease-out ${
              editMode ? '' : 'group-hover:opacity-0 group-hover:scale-110'
            }`}
            sizes="(max-width: 768px) 50vw, 25vw"
            unoptimized
          />
        )}
        {!editMode && hoverImage && (
          <Image
            src={hoverImage}
            alt={product.title}
            fill
            className="object-cover absolute inset-0 opacity-0 scale-110 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-100"
            sizes="(max-width: 768px) 50vw, 25vw"
            unoptimized
          />
        )}

        {onSale && (
          <span className="absolute top-2 left-2 bg-[var(--gold)] text-black text-[10px] font-bold px-2 py-1 rounded-full z-10">
            SALE
          </span>
        )}
        {outOfStock && !editMode && (
          <span className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs font-semibold tracking-wide z-10">
            OUT OF STOCK
          </span>
        )}

        {editMode && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              disabled={uploading}
              className="bg-[var(--gold)] text-black text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[var(--gold-light)]"
            >
              {uploading ? 'Uploading...' : '📷 Replace'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageReplace}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {!editMode && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10">
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-sm text-neutral-200 line-clamp-2 min-h-[2.5rem] transition-colors duration-300 group-hover:text-white">
          {product.title}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          {editMode && editingPrice ? (
            <input
              autoFocus
              type="number"
              defaultValue={product.price}
              onChange={(e) => setPriceDraft(e.target.value)}
              onClick={(e) => e.preventDefault()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') savePrice(e);
              }}
              onBlur={savePrice}
              className="w-24 bg-black border border-[var(--gold)] rounded px-2 py-0.5 text-sm outline-none"
            />
          ) : (
            <span
              onClick={(e) => {
                if (editMode) {
                  e.preventDefault();
                  e.stopPropagation();
                  setPriceDraft(String(product.price));
                  setEditingPrice(true);
                }
              }}
              className={`text-[var(--gold)] font-semibold transition-transform duration-300 group-hover:scale-105 inline-block ${
                editMode ? 'cursor-pointer ring-1 ring-dashed ring-[var(--gold)]/50 rounded px-1' : ''
              }`}
            >
              Rs. {product.price.toLocaleString()}
            </span>
          )}
          {onSale && (
            <span className="text-neutral-500 text-xs line-through">
              Rs. {product.compare_at_price!.toLocaleString()}
            </span>
          )}
        </div>
        {!outOfStock && !editMode && (
          <button
            onClick={handleAddToCart}
            className="mt-2 w-full text-xs font-semibold bg-[var(--gold)] text-black rounded-lg py-1.5 transition-all duration-300 hover:bg-[var(--gold-light)] opacity-90 group-hover:opacity-100 translate-y-0.5 group-hover:translate-y-0 group-hover:shadow-md group-hover:shadow-[var(--gold)]/30"
          >
            + Add to Cart
          </button>
        )}
      </div>
    </Link>
  );
}
