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

export default function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
      head: [['Date', 'Customer', 'Email', 'Phone', 'City', 'Items Bought', 'Total']],
      body: filtered.map((o) => [
        new Date(o.created_at).toLocaleDateString(),
        o.customer_name,
        o.email || '-',
        o.phone,
        o.city,
        o.order_items.map((i) => `${i.title} x${i.quantity}`).join(', '),
        `Rs. ${o.total.toLocaleString()}`,
      ]),
      styles: { fontSize: 7, cellWidth: 'wrap' },
      headStyles: { fillColor: [30, 30, 30] },
      columnStyles: { 5: { cellWidth: 55 } },
    });

    doc.save(`basera-bazaar-orders-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  const uniqueCustomers = new Set(orders.map((o) => o.phone)).size;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

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
        <div className="overflow-x-auto card rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left text-neutral-400">
                <th className="p-3">Date</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Contact</th>
                <th className="p-3">City</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-neutral-900 hover:bg-neutral-950 align-top">
                  <td className="p-3 text-neutral-400 whitespace-nowrap">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">{o.customer_name}</td>
                  <td className="p-3 text-neutral-400">
                    <p>{o.email || '-'}</p>
                    <p>{o.phone}</p>
                  </td>
                  <td className="p-3 text-neutral-400">{o.city}</td>
                  <td className="p-3 max-w-xs">
                    {o.order_items.map((i) => (
                      <p key={i.id} className="text-xs text-neutral-300">
                        {i.title} × {i.quantity}
                      </p>
                    ))}
                  </td>
                  <td className="p-3 text-[var(--gold)] font-semibold whitespace-nowrap">
                    Rs. {o.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
