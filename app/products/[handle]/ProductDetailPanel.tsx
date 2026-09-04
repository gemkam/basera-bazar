'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { usePowerEditor } from '@/lib/power-editor-context';
import AddToCartBox from './AddToCartBox';
import ShareOnWhatsApp from '@/components/ShareOnWhatsApp';

type ProductData = {
  id: string;
  handle: string;
  title: string;
  description_html: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  images: string[];
  image_position?: string | null;
};

export default function ProductDetailPanel({
  product: initialProduct,
  siteUrl,
}: {
  product: ProductData;
  siteUrl: string;
}) {
  const { editMode } = usePowerEditor();
  const [product, setProduct] = useState(initialProduct);
  const [editingPrice, setEditingPrice] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [priceDraft, setPriceDraft] = useState('');
  const [descDraft, setDescDraft] = useState('');
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [showPositionPanel, setShowPositionPanel] = useState(false);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const onSale = product.compare_at_price && product.compare_at_price > product.price;
  const outOfStock = product.stock <= 0;

  const [posXStr, posYStr] = (product.image_position || '50% 50%').split(' ');
  const posX = parseInt(posXStr) || 50;
  const posY = parseInt(posYStr) || 50;

  async function saveField(fields: Record<string, unknown>) {
    await fetch(`/api/admin/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
  }

  async function savePosition(newX: number, newY: number) {
    const clampedX = Math.min(100, Math.max(0, newX));
    const clampedY = Math.min(100, Math.max(0, newY));
    const value = `${clampedX}% ${clampedY}%`;
    await saveField({ image_position: value });
    setProduct((p) => ({ ...p, image_position: value }));
  }

  async function savePrice() {
    const newPrice = Number(priceDraft);
    if (!isNaN(newPrice)) {
      await saveField({ price: newPrice });
      setProduct((p) => ({ ...p, price: newPrice }));
    }
    setEditingPrice(false);
  }

  async function saveDescription() {
    await saveField({ description_html: descDraft });
    setProduct((p) => ({ ...p, description_html: descDraft }));
    setEditingDesc(false);
  }

  async function handleImageReplace(idx: number, file: File) {
    setUploadingSlot(idx);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    if (res.ok) {
      const data = await res.json();
      const newImages = [...product.images];
      newImages[idx] = data.url;
      await saveField({ images: newImages });
      setProduct((p) => ({ ...p, images: newImages }));
    }
    setUploadingSlot(null);
  }

  async function handleAddImage(file: File) {
    setUploadingSlot(-1);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    if (res.ok) {
      const data = await res.json();
      const newImages = [...product.images, data.url];
      await saveField({ images: newImages });
      setProduct((p) => ({ ...p, images: newImages }));
    }
    setUploadingSlot(null);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 grid md:grid-cols-2 gap-10">
      <div className="space-y-3">
        <div className="relative aspect-square bg-neutral-50 rounded-xl overflow-hidden">
          {product.images?.[0] && (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              style={{ objectPosition: `${posX}% ${posY}%` }}
              className="object-cover"
              unoptimized
              priority
            />
          )}
          {editMode && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2">
              <button
                onClick={() => fileInputRefs.current[0]?.click()}
                disabled={uploadingSlot === 0}
                className="bg-[var(--gold)] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[var(--gold-light)]"
              >
                {uploadingSlot === 0 ? 'Uploading...' : '📷 Replace Main Image'}
              </button>
              <button
                onClick={() => setShowPositionPanel((p) => !p)}
                className="bg-neutral-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-neutral-800"
              >
                🎯 Position
              </button>
              <input
                ref={(el) => { fileInputRefs.current[0] = el; }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageReplace(0, file);
                  e.target.value = '';
                }}
              />
            </div>
          )}
          {editMode && showPositionPanel && (
            <div className="absolute bottom-3 right-3 bg-black/80 rounded-xl p-2 grid grid-cols-3 gap-1 w-32">
              <div />
              <button onClick={() => savePosition(posX, posY - 5)} className="bg-white/10 hover:bg-white/20 text-white rounded py-1 text-sm">▲</button>
              <div />
              <button onClick={() => savePosition(posX - 5, posY)} className="bg-white/10 hover:bg-white/20 text-white rounded py-1 text-sm">◄</button>
              <button
                onClick={() => savePosition(50, 50)}
                title="Reset to center"
                className="bg-white/10 hover:bg-white/20 text-white rounded py-1 text-xs"
              >
                ⟲
              </button>
              <button onClick={() => savePosition(posX + 5, posY)} className="bg-white/10 hover:bg-white/20 text-white rounded py-1 text-sm">►</button>
              <div />
              <button onClick={() => savePosition(posX, posY + 5)} className="bg-white/10 hover:bg-white/20 text-white rounded py-1 text-sm">▼</button>
              <div />
            </div>
          )}
        </div>

        {(product.images?.length > 1 || editMode) && (
          <div className="grid grid-cols-4 gap-2">
            {product.images.slice(1, 5).map((img, i) => {
              const idx = i + 1;
              return (
                <div key={idx} className="relative aspect-square bg-neutral-50 rounded-lg overflow-hidden">
                  <Image src={img} alt="" fill className="object-cover" unoptimized />
                  {editMode && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <button
                        onClick={() => fileInputRefs.current[idx]?.click()}
                        disabled={uploadingSlot === idx}
                        className="text-[10px] bg-[var(--gold)] text-white font-semibold px-1.5 py-1 rounded"
                      >
                        {uploadingSlot === idx ? '...' : '📷'}
                      </button>
                      <input
                        ref={(el) => { fileInputRefs.current[idx] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageReplace(idx, file);
                          e.target.value = '';
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
            {editMode && (
              <label className="relative aspect-square rounded-lg border border-dashed border-neutral-300 hover:border-[var(--gold)] flex items-center justify-center cursor-pointer text-neutral-500 text-xs">
                {uploadingSlot === -1 ? '...' : '+ Add'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAddImage(file);
                    e.target.value = '';
                  }}
                />
              </label>
            )}
          </div>
        )}
      </div>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-4">{product.title}</h1>

        <div className="flex items-center gap-3 mb-4">
          {editMode && editingPrice ? (
            <input
              autoFocus
              type="number"
              defaultValue={product.price}
              onChange={(e) => setPriceDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && savePrice()}
              onBlur={savePrice}
              className="w-32 bg-black border border-[var(--gold)] rounded-lg px-2 py-1 text-xl font-bold outline-none"
            />
          ) : (
            <span
              onClick={() => {
                if (editMode) {
                  setPriceDraft(String(product.price));
                  setEditingPrice(true);
                }
              }}
              className={`text-2xl font-bold text-[var(--gold)] ${
                editMode ? 'cursor-pointer ring-1 ring-dashed ring-[var(--gold)]/50 rounded px-1' : ''
              }`}
            >
              Rs. {product.price.toLocaleString()}
            </span>
          )}
          {onSale && (
            <span className="text-neutral-500 line-through">
              Rs. {product.compare_at_price!.toLocaleString()}
            </span>
          )}
        </div>

        <div className="mb-6">
          {outOfStock ? (
            <span className="inline-block px-3 py-1 rounded-full text-xs bg-red-50 text-red-700 border border-red-200">
              Out of Stock
            </span>
          ) : (
            <span className="inline-block px-3 py-1 rounded-full text-xs bg-green-50 text-green-700 border border-green-200">
              In Stock ({product.stock} available)
            </span>
          )}
        </div>

        {!editMode && (
          <>
            <div className="mb-6">
              <AddToCartBox
                product={{
                  id: product.id,
                  handle: product.handle,
                  title: product.title,
                  price: product.price,
                  images: product.images,
                  stock: product.stock,
                }}
              />
            </div>
            <div className="mb-6">
              <ShareOnWhatsApp
                title={product.title}
                price={product.price}
                url={`${siteUrl}/products/${product.handle}`}
              />
            </div>
          </>
        )}

        {editMode && editingDesc ? (
          <div className="space-y-2">
            <textarea
              autoFocus
              rows={8}
              defaultValue={product.description_html || ''}
              onChange={(e) => setDescDraft(e.target.value)}
              className="w-full bg-black border border-[var(--gold)] rounded-lg px-3 py-2 text-sm outline-none"
            />
            <button
              onClick={saveDescription}
              className="bg-[var(--gold)] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[var(--gold-light)]"
            >
              Save Description
            </button>
          </div>
        ) : (
          <div
            onClick={() => {
              if (editMode) {
                setDescDraft(product.description_html || '');
                setEditingDesc(true);
              }
            }}
            className={`prose prose-sm max-w-none text-neutral-700 leading-relaxed whitespace-pre-line ${
              editMode ? 'cursor-pointer ring-1 ring-dashed ring-[var(--gold)]/50 hover:ring-[var(--gold)] rounded p-2' : ''
            }`}
          >
            {product.description_html || (editMode ? 'Click to add a description...' : '')}
          </div>
        )}
      </div>
    </div>
  );
}
