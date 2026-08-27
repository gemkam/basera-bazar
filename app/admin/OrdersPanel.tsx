'use client';

import { useState, useEffect, useCallback } from 'react';

type OrderItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  customer_name: string;
  email: string | null;
  phone: string;
  address: string;
  city: string;
  notes: string | null;
  status: string;
  total: number;
  created_at: string;
  order_items: OrderItem[];
};

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    customer_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/orders');
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filtered = orders.filter(
    (o) =>
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search) ||
      (o.email || '').toLowerCase().includes(search.toLowerCase())
  );

  async function handleStatusChange(id: string, status: string) {
    setSavingId(id);
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    setSavingId(null);
  }

  function startEdit(order: Order) {
    setEditingId(order.id);
    setEditForm({
      customer_name: order.customer_name,
      email: order.email || '',
      phone: order.phone,
      address: order.address,
      city: order.city,
      notes: order.notes || '',
    });
  }

  async function saveEdit(id: string) {
    setSavingId(id);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...editForm } : o)));
      setEditingId(null);
    }
    setSavingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this order permanently? This cannot be undone.')) return;
    await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' });
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  async function handleDownloadPdf() {
    const jsPDFModule = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDFModule.default();

    doc.setFontSize(16);
    doc.text('BaZariFy — Customer Orders Report', 14, 15);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 21);
    doc.text(`Total orders: ${filtered.length}`, 14, 26);

    autoTable(doc, {
      startY: 31,
      head: [['Date', 'Customer', 'Email', 'Phone', 'City', 'Items Bought', 'Status', 'Total']],
      body: filtered.map((o) => [
        new Date(o.created_at).toLocaleDateString(),
        o.customer_name,
        o.email || '-',
        o.phone,
        o.city,
        o.order_items.map((i) => `${i.title} x${i.quantity}`).join(', '),
        o.status,
        `Rs. ${o.total.toLocaleString()}`,
      ]),
      styles: { fontSize: 7, cellWidth: 'wrap' },
      headStyles: { fillColor: [30, 30, 30] },
      columnStyles: { 5: { cellWidth: 50 } },
    });

    doc.save(`bazarify-orders-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  const uniqueCustomers = new Set(orders.map((o) => o.phone)).size;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  function statusColor(status: string) {
    switch (status) {
      case 'delivered':
        return 'text-green-400 border-green-800 bg-green-950/50';
      case 'cancelled':
        return 'text-red-400 border-red-800 bg-red-950/50';
      case 'shipped':
        return 'text-blue-400 border-blue-800 bg-blue-950/50';
      case 'confirmed':
        return 'text-[var(--gold)] border-[var(--gold)]/40 bg-[var(--gold)]/10';
      default:
        return 'text-neutral-400 border-neutral-700';
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card rounded-xl p-4">
          <p className="text-neutral-500 text-xs">Total Orders</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="card rounded-xl p-4">
          <p className="text-neutral-500 text-xs">Unique Customers</p>
          <p className="text-2xl font-bold text-green-400">{uniqueCustomers}</p>
        </div>
        <div className="card rounded-xl p-4">
          <p className="text-neutral-500 text-xs">Total Revenue</p>
          <p className="text-2xl font-bold text-[var(--gold)]">Rs. {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="card rounded-xl p-4 flex items-center">
          <button
            onClick={handleDownloadPdf}
            className="w-full text-sm px-3 py-2 border border-neutral-700 rounded-lg hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
          >
            Download Orders PDF
          </button>
        </div>
      </div>

      <input
        placeholder="Search by name, phone, or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
      />

      {loading ? (
        <p className="text-neutral-500 text-center py-12">Loading orders...</p>
      ) : filtered.length === 0 ? (
        <p className="text-neutral-500 text-center py-12">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <div key={o.id} className="card rounded-xl p-4">
              {editingId === o.id ? (
                <div className="space-y-2">
                  <div className="grid md:grid-cols-2 gap-2">
                    <input
                      placeholder="Name"
                      value={editForm.customer_name}
                      onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
                      className="bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
                    />
                    <input
                      placeholder="Email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
                    />
                    <input
                      placeholder="Phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
                    />
                    <input
                      placeholder="City"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
                    />
                  </div>
                  <textarea
                    placeholder="Address"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
                  />
                  <textarea
                    placeholder="Notes"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(o.id)}
                      disabled={savingId === o.id}
                      className="text-sm px-4 py-2 bg-[var(--gold)] text-black font-semibold rounded-lg hover:bg-[var(--gold-light)] disabled:opacity-50"
                    >
                      {savingId === o.id ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-sm px-4 py-2 border border-neutral-700 rounded-lg hover:border-neutral-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{o.customer_name}</p>
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border outline-none cursor-pointer ${statusColor(o.status)}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="bg-black text-white">
                            {s}
                          </option>
                        ))}
                      </select>
                      {savingId === o.id && <span className="text-xs text-neutral-500">saving...</span>}
                    </div>
                    <p className="text-neutral-400 text-sm mt-1">
                      {o.email || '-'} • {o.phone} • {o.city}
                    </p>
                    <p className="text-neutral-500 text-xs mt-1">{o.address}</p>
                    <div className="mt-2">
                      {o.order_items.map((i) => (
                        <p key={i.id} className="text-xs text-neutral-300">
                          {i.title} × {i.quantity}
                        </p>
                      ))}
                    </div>
                    {o.notes && <p className="text-xs text-neutral-500 mt-1 italic">Note: {o.notes}</p>}
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="text-neutral-500 text-xs whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-[var(--gold)] font-semibold whitespace-nowrap">
                      Rs. {o.total.toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(o)}
                        className="text-xs text-neutral-400 hover:text-[var(--gold)]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(o.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
