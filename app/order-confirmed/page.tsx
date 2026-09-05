'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

type OrderItem = { title: string; price: number; quantity: number };
type Order = {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string | null;
  total: number;
  created_at: string;
};

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load PDF library'));
    document.body.appendChild(script);
  });
}

async function buildInvoicePdf(order: Order, items: OrderItem[]) {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

  const w = window as unknown as { jspdf: { jsPDF: new (...args: unknown[]) => JsPDFDoc } };
  type JsPDFDoc = {
    setFont: (font: string, style?: string) => void;
    setFontSize: (size: number) => void;
    setTextColor: (r: number, g?: number, b?: number) => void;
    setDrawColor: (r: number, g?: number, b?: number) => void;
    setLineWidth: (w: number) => void;
    text: (text: string, x: number, y: number, opts?: Record<string, unknown>) => void;
    line: (x1: number, y1: number, x2: number, y2: number) => void;
    rect: (x: number, y: number, w: number, h: number, style?: string) => void;
    setFillColor: (r: number, g?: number, b?: number) => void;
    save: (filename: string) => void;
  };

  const doc = new w.jspdf.jsPDF({ unit: 'mm', format: 'a4' }) as JsPDFDoc;

  const pageW = 210;
  const marginX = 18;
  let y = 22;

  // Outer frame for a premium, bordered look
  doc.setDrawColor(17, 17, 17);
  doc.setLineWidth(0.6);
  doc.rect(8, 8, pageW - 16, 297 - 16);
  doc.setLineWidth(0.15);
  doc.rect(11, 11, pageW - 22, 297 - 22);

  // Wordmark
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(17, 17, 17);
  doc.text('BAZARIFY', marginX, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('QUALITY PRODUCTS AT UNBEATABLE PRICES', marginX, y + 5);

  // Invoice label + meta, right aligned
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(17, 17, 17);
  doc.text('INVOICE', pageW - marginX, y - 2, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  const orderDate = new Date(order.created_at).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  doc.text(`Order ID: ${order.id.slice(0, 8).toUpperCase()}`, pageW - marginX, y + 4, { align: 'right' });
  doc.text(`Date: ${orderDate}`, pageW - marginX, y + 9, { align: 'right' });

  y += 18;
  doc.setDrawColor(17, 17, 17);
  doc.setLineWidth(0.4);
  doc.line(marginX, y, pageW - marginX, y);
  y += 10;

  // Bill To
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(17, 17, 17);
  doc.text('BILL TO', marginX, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text(order.customer_name, marginX, y);
  y += 5;
  doc.setTextColor(90, 90, 90);
  doc.setFontSize(9);
  doc.text(order.phone, marginX, y);
  y += 4.5;
  doc.text(order.email, marginX, y);
  y += 4.5;
  doc.text(`${order.address}, ${order.city}`, marginX, y);
  y += 10;

  // Table header
  doc.setFillColor(17, 17, 17);
  doc.rect(marginX, y, pageW - marginX * 2, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('ITEM', marginX + 3, y + 5.5);
  doc.text('QTY', pageW - marginX - 55, y + 5.5, { align: 'right' });
  doc.text('PRICE', pageW - marginX - 30, y + 5.5, { align: 'right' });
  doc.text('TOTAL', pageW - marginX - 3, y + 5.5, { align: 'right' });
  y += 8;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(9);
  let rowShade = false;
  for (const item of items) {
    const rowHeight = 8;
    if (rowShade) {
      doc.setFillColor(247, 247, 247);
      doc.rect(marginX, y, pageW - marginX * 2, rowHeight, 'F');
    }
    rowShade = !rowShade;

    const titleLines = doc.text(item.title, marginX + 3, y + 5.5, { maxWidth: 95 } as Record<string, unknown>);
    void titleLines;
    doc.text(String(item.quantity), pageW - marginX - 55, y + 5.5, { align: 'right' });
    doc.text(`Rs. ${item.price.toLocaleString()}`, pageW - marginX - 30, y + 5.5, { align: 'right' });
    doc.text(`Rs. ${(item.price * item.quantity).toLocaleString()}`, pageW - marginX - 3, y + 5.5, { align: 'right' });
    y += rowHeight;
  }

  y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(marginX, y, pageW - marginX, y);
  y += 8;

  // Total box
  doc.setFillColor(17, 17, 17);
  doc.rect(pageW - marginX - 70, y - 6, 70, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL', pageW - marginX - 65, y + 1.5);
  doc.text(`Rs. ${order.total.toLocaleString()}`, pageW - marginX - 3, y + 1.5, { align: 'right' });
  y += 18;

  // Payment + footer note
  doc.setTextColor(90, 90, 90);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Payment Method: Cash on Delivery (COD)', marginX, y);
  y += 14;

  doc.setDrawColor(220, 220, 220);
  doc.line(marginX, y, pageW - marginX, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(17, 17, 17);
  doc.text('Thank you for shopping with BaZariFy.', marginX, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(120, 120, 120);
  doc.text('For any questions about your order, reach us anytime on WhatsApp: 923094415485', marginX, y);

  doc.save(`BaZariFy-Invoice-${order.id.slice(0, 8).toUpperCase()}.pdf`);
}

function Confirmation() {
  const params = useSearchParams();
  const orderId = params.get('id');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (!orderId || triggeredRef.current) return;
    triggeredRef.current = true;

    (async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) throw new Error('Order not found');
        const { order, items } = await res.json();
        await buildInvoicePdf(order, items);
        setStatus('ready');
      } catch {
        setStatus('error');
      }
    })();
  }, [orderId]);

  const whatsappNumber = '923094415485';
  const whatsappMessage = orderId
    ? encodeURIComponent(
        `Hi! Here is my order confirmation. Order ID: ${orderId.slice(0, 8).toUpperCase()}. Could you please confirm delivery?`
      )
    : encodeURIComponent('Hi! I just placed an order on BaZariFy.');

  return (
    <div className="max-w-xl mx-auto px-4 md:px-6 py-20 text-center">
      <div className="text-5xl mb-4">✅</div>
      <h1 className="text-2xl font-bold mb-3">
        Order <span className="gold-gradient">Confirmed!</span>
      </h1>
      <p className="text-neutral-600 mb-2">
        Thank you for your order. We&apos;ll contact you shortly to confirm delivery.
      </p>
      {orderId && (
        <p className="text-neutral-500 text-xs mb-6">Order ID: {orderId.slice(0, 8).toUpperCase()}</p>
      )}
      <p className="text-neutral-600 mb-4">
        Payment: <span className="text-[var(--gold)]">Cash on Delivery</span>
      </p>

      <p className="text-xs text-neutral-500 mb-8">
        {status === 'loading' && 'Preparing your invoice...'}
        {status === 'ready' && 'Your invoice has been downloaded.'}
        {status === 'error' && "We couldn't generate your invoice automatically, but your order is confirmed."}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/products"
          className="inline-block bg-[var(--gold)] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[var(--gold-light)] transition-colors"
        >
          Continue Shopping
        </Link>
        <a
          href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block border border-neutral-300 text-neutral-800 font-semibold px-6 py-2.5 rounded-lg hover:border-[var(--gold)] transition-colors"
        >
          Send Order via WhatsApp
        </a>
      </div>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-neutral-500">Loading...</div>}>
      <Confirmation />
    </Suspense>
  );
}