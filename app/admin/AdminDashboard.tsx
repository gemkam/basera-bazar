'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePowerEditor } from '@/lib/power-editor-context';
import OrdersPanel from './OrdersPanel';
import AccountPanel from './AccountPanel';

type Category = { id: string; name: string; slug: string };
type Product = {
  id: string;
  handle: string;
  title: string;
  description_html: string;
  category_id: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  images: string[];
  is_active: boolean;
  categories?: { name: string; slug: string };
};

const emptyForm = {
  title: '',
  description_html: '',
  category_id: '',
  price: 0,
  compare_at_price: '' as number | '',
  stock: 0,
  images: [] as string[],
  imageUrlInput: '',
};

export default function AdminDashboard({ categories }: { categories: Category[] }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<'products' | 'orders' | 'account'>('products');
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [editProductForm, setEditProductForm] = useState(emptyForm);
  const [editUploading, setEditUploading] = useState(false);
  const router = useRouter();
  const { editMode, toggleEditMode } = usePowerEditor();

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/products');
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        setForm((f) => ({ ...f, images: [...f.images, data.url] }));
      }
    }
    setUploading(false);
    e.target.value = '';
  }

  function handleAddUrl() {
    const url = form.imageUrlInput.trim();
    if (!url) return;
    setForm((f) => ({ ...f, images: [...f.images, url], imageUrlInput: '' }));
  }

  function handleRemoveImage(idx: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description_html: form.description_html,
        category_id: form.category_id || null,
        price: Number(form.price),
        compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
        stock: Number(form.stock),
        images: form.images,
      }),
    });
    if (res.ok) {
      setForm(emptyForm);
      setShowAddForm(false);
      loadProducts();
    }
  }

  async function updateField(id: string, field: string, value: unknown) {
    setSavingId(id);
    await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
    setSavingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product permanently?')) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function startEditProduct(p: Product) {
    setEditProductId(p.id);
    setEditProductForm({
      title: p.title,
      description_html: p.description_html || '',
      category_id: p.category_id || '',
      price: p.price,
      compare_at_price: p.compare_at_price ?? '',
      stock: p.stock,
      images: p.images || [],
      imageUrlInput: '',
    });
  }

  async function handleEditFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setEditUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        setEditProductForm((f) => ({ ...f, images: [...f.images, data.url] }));
      }
    }
    setEditUploading(false);
    e.target.value = '';
  }

  function handleEditAddUrl() {
    const url = editProductForm.imageUrlInput.trim();
    if (!url) return;
    setEditProductForm((f) => ({ ...f, images: [...f.images, url], imageUrlInput: '' }));
  }

  function handleEditRemoveImage(idx: number) {
    setEditProductForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  async function saveEditProduct() {
    if (!editProductId) return;
    setSavingId(editProductId);
    const res = await fetch(`/api/admin/products/${editProductId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editProductForm.title,
        description_html: editProductForm.description_html,
        category_id: editProductForm.category_id || null,
        price: Number(editProductForm.price),
        compare_at_price: editProductForm.compare_at_price ? Number(editProductForm.compare_at_price) : null,
        stock: Number(editProductForm.stock),
        images: editProductForm.images,
      }),
    });
    if (res.ok) {
      setEditProductId(null);
      loadProducts();
    }
    setSavingId(null);
  }

  async function handleDownloadPdf() {
    const jsPDFModule = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDFModule.default();

    doc.setFontSize(16);
    doc.text('BaZariFy — Inventory Report', 14, 15);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 21);

    autoTable(doc, {
      startY: 26,
      head: [['Title', 'Category', 'Price', 'Compare At', 'Stock', 'Status']],
      body: filtered.map((p) => [
        p.title,
        p.categories?.name || '-',
        `Rs. ${p.price.toLocaleString()}`,
        p.compare_at_price ? `Rs. ${p.compare_at_price.toLocaleString()}` : '-',
        String(p.stock),
        p.stock > 0 ? 'In Stock' : 'Out of Stock',
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 30, 30] },
    });

    doc.save(`bazarify-inventory-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">
          Admin <span className="gold-gradient">Dashboard</span>
        </h1>
        <div className="flex gap-2">
          <button
            onClick={toggleEditMode}
            className={`text-sm px-4 py-2 rounded-lg font-semibold transition-colors ${
              editMode
                ? 'bg-[var(--gold)] text-black hover:bg-[var(--gold-light)]'
                : 'border border-neutral-700 hover:border-[var(--gold)] hover:text-[var(--gold)]'
            }`}
          >
            {editMode ? '⚡ Power Editor: ON' : '⚡ Power Editor: OFF'}
          </button>
          <button
            onClick={handleDownloadPdf}
            className="text-sm px-4 py-2 border border-neutral-700 rounded-lg hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
          >
            Download Inventory PDF
          </button>
          <button
            onClick={() => setShowAddForm((s) => !s)}
            className="text-sm px-4 py-2 bg-[var(--gold)] text-black font-semibold rounded-lg hover:bg-[var(--gold-light)] transition-colors"
          >
            {showAddForm ? 'Cancel' : '+ Add Product'}
          </button>
          <button
            onClick={handleLogout}
            className="text-sm px-4 py-2 border border-neutral-700 rounded-lg hover:border-red-500 hover:text-red-400 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-neutral-800">
        <button
          onClick={() => setTab('products')}
          className={`text-sm px-4 py-2 border-b-2 transition-colors ${
            tab === 'products'
              ? 'border-[var(--gold)] text-[var(--gold)]'
              : 'border-transparent text-neutral-500 hover:text-white'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setTab('orders')}
          className={`text-sm px-4 py-2 border-b-2 transition-colors ${
            tab === 'orders'
              ? 'border-[var(--gold)] text-[var(--gold)]'
              : 'border-transparent text-neutral-500 hover:text-white'
          }`}
        >
          Orders &amp; Customers
        </button>
        <button
          onClick={() => setTab('account')}
          className={`text-sm px-4 py-2 border-b-2 transition-colors ${
            tab === 'account'
              ? 'border-[var(--gold)] text-[var(--gold)]'
              : 'border-transparent text-neutral-500 hover:text-white'
          }`}
        >
          Account
        </button>
      </div>

      {tab === 'orders' ? (
        <OrdersPanel />
      ) : tab === 'account' ? (
        <AccountPanel />
      ) : (
      <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card rounded-xl p-4">
          <p className="text-neutral-500 text-xs">Total Products</p>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        <div className="card rounded-xl p-4">
          <p className="text-neutral-500 text-xs">In Stock</p>
          <p className="text-2xl font-bold text-green-400">
            {products.filter((p) => p.stock > 0).length}
          </p>
        </div>
        <div className="card rounded-xl p-4">
          <p className="text-neutral-500 text-xs">Out of Stock</p>
          <p className="text-2xl font-bold text-red-400">
            {products.filter((p) => p.stock <= 0).length}
          </p>
        </div>
        <div className="card rounded-xl p-4">
          <p className="text-neutral-500 text-xs">Total Inventory Value</p>
          <p className="text-2xl font-bold text-[var(--gold)]">
            Rs. {products.reduce((sum, p) => sum + p.price * p.stock, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="card rounded-xl p-6 mb-6 space-y-3">
          <h2 className="font-semibold mb-2">New Product</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <input
              placeholder="Title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
            />
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Price"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
            />
            <input
              type="number"
              placeholder="Compare at price (optional)"
              value={form.compare_at_price}
              onChange={(e) =>
                setForm({ ...form, compare_at_price: e.target.value ? Number(e.target.value) : '' })
              }
              className="bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
            />
            <input
              type="number"
              placeholder="Stock"
              required
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              className="bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs text-neutral-400">Product Images</p>
            <div className="flex flex-wrap gap-2">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-neutral-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-0 right-0 bg-black/70 text-red-400 text-xs w-5 h-5 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              <label className="flex-1 cursor-pointer text-center text-sm border border-dashed border-neutral-700 rounded-lg px-3 py-2 hover:border-[var(--gold)] transition-colors">
                {uploading ? 'Uploading...' : '📁 Upload Image(s) from Device'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <div className="flex-1 flex gap-2">
                <input
                  placeholder="Or paste an image URL"
                  value={form.imageUrlInput}
                  onChange={(e) => setForm({ ...form, imageUrlInput: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddUrl();
                    }
                  }}
                  className="flex-1 bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="text-sm px-3 py-2 border border-neutral-700 rounded-lg hover:border-[var(--gold)] hover:text-[var(--gold)]"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
          <textarea
            placeholder="Description"
            rows={3}
            value={form.description_html}
            onChange={(e) => setForm({ ...form, description_html: e.target.value })}
            className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
          />
          <button
            type="submit"
            className="bg-[var(--gold)] text-black font-semibold rounded-lg px-4 py-2 text-sm hover:bg-[var(--gold-light)]"
          >
            Save Product
          </button>
        </form>
      )}

      <input
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
      />

      {loading ? (
        <p className="text-neutral-500 text-center py-12">Loading products...</p>
      ) : (
        <div className="overflow-x-auto card rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left text-neutral-400">
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-neutral-900 hover:bg-neutral-950">
                  <td className="p-3 max-w-xs">
                    <p className="line-clamp-2">{p.title}</p>
                  </td>
                  <td className="p-3 text-neutral-400">{p.categories?.name || '-'}</td>
                  <td className="p-3">
                    {editingId === `${p.id}-price` ? (
                      <input
                        type="number"
                        autoFocus
                        defaultValue={p.price}
                        onBlur={(e) => {
                          updateField(p.id, 'price', Number(e.target.value));
                          setEditingId(null);
                        }}
                        className="w-24 bg-black border border-[var(--gold)] rounded px-2 py-1 text-sm"
                      />
                    ) : (
                      <button
                        onClick={() => setEditingId(`${p.id}-price`)}
                        className="hover:text-[var(--gold)]"
                      >
                        Rs. {p.price.toLocaleString()}
                      </button>
                    )}
                  </td>
                  <td className="p-3">
                    {editingId === `${p.id}-stock` ? (
                      <input
                        type="number"
                        autoFocus
                        defaultValue={p.stock}
                        onBlur={(e) => {
                          updateField(p.id, 'stock', Number(e.target.value));
                          setEditingId(null);
                        }}
                        className="w-20 bg-black border border-[var(--gold)] rounded px-2 py-1 text-sm"
                      />
                    ) : (
                      <button
                        onClick={() => setEditingId(`${p.id}-stock`)}
                        className={p.stock <= 0 ? 'text-red-400' : 'hover:text-[var(--gold)]'}
                      >
                        {p.stock}
                      </button>
                    )}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => updateField(p.id, 'is_active', !p.is_active)}
                      className={`text-xs px-2 py-1 rounded-full border ${
                        p.is_active
                          ? 'border-green-800 text-green-400 bg-green-950/50'
                          : 'border-neutral-700 text-neutral-500'
                      }`}
                    >
                      {p.is_active ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    {savingId === p.id && (
                      <span className="text-xs text-neutral-500 mr-2">saving...</span>
                    )}
                    <button
                      onClick={() => startEditProduct(p)}
                      className="text-xs text-neutral-400 hover:text-[var(--gold)] mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </>
      )}

      {editProductId && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="card rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-lg">Edit Product</h2>
              <button
                onClick={() => setEditProductId(null)}
                className="text-neutral-400 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <input
                placeholder="Title"
                value={editProductForm.title}
                onChange={(e) => setEditProductForm({ ...editProductForm, title: e.target.value })}
                className="bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
              />
              <select
                value={editProductForm.category_id}
                onChange={(e) => setEditProductForm({ ...editProductForm, category_id: e.target.value })}
                className="bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Price"
                value={editProductForm.price}
                onChange={(e) => setEditProductForm({ ...editProductForm, price: Number(e.target.value) })}
                className="bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
              />
              <input
                type="number"
                placeholder="Compare at price (optional)"
                value={editProductForm.compare_at_price}
                onChange={(e) =>
                  setEditProductForm({
                    ...editProductForm,
                    compare_at_price: e.target.value ? Number(e.target.value) : '',
                  })
                }
                className="bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
              />
              <input
                type="number"
                placeholder="Stock"
                value={editProductForm.stock}
                onChange={(e) => setEditProductForm({ ...editProductForm, stock: Number(e.target.value) })}
                className="bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
              />
            </div>

            <textarea
              placeholder="Description"
              rows={3}
              value={editProductForm.description_html}
              onChange={(e) => setEditProductForm({ ...editProductForm, description_html: e.target.value })}
              className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
            />

            <div className="space-y-2">
              <p className="text-xs text-neutral-400">Product Images</p>
              <div className="flex flex-wrap gap-2">
                {editProductForm.images.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-neutral-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleEditRemoveImage(idx)}
                      className="absolute top-0 right-0 bg-black/70 text-red-400 text-xs w-5 h-5 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex flex-col md:flex-row gap-2">
                <label className="flex-1 cursor-pointer text-center text-sm border border-dashed border-neutral-700 rounded-lg px-3 py-2 hover:border-[var(--gold)] transition-colors">
                  {editUploading ? 'Uploading...' : '📁 Upload Image(s)'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleEditFileUpload}
                    disabled={editUploading}
                    className="hidden"
                  />
                </label>
                <div className="flex-1 flex gap-2">
                  <input
                    placeholder="Or paste an image URL"
                    value={editProductForm.imageUrlInput}
                    onChange={(e) => setEditProductForm({ ...editProductForm, imageUrlInput: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleEditAddUrl();
                      }
                    }}
                    className="flex-1 bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
                  />
                  <button
                    type="button"
                    onClick={handleEditAddUrl}
                    className="text-sm px-3 py-2 border border-neutral-700 rounded-lg hover:border-[var(--gold)] hover:text-[var(--gold)]"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={saveEditProduct}
                disabled={savingId === editProductId}
                className="flex-1 bg-[var(--gold)] text-black font-semibold rounded-lg py-2.5 hover:bg-[var(--gold-light)] disabled:opacity-50"
              >
                {savingId === editProductId ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditProductId(null)}
                className="px-6 border border-neutral-700 rounded-lg hover:border-neutral-500"
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
