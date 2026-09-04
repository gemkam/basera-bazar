import Link from 'next/link';
import SubscribeForm from './SubscribeForm';
import EditableText from './EditableText';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <p className="font-bold text-lg mb-2">
            <span className="glass-logo">BaZariFy</span>
          </p>
          <p className="text-neutral-500 text-sm">
            <EditableText
              settingKey="footer_tagline"
              fallback="Quality products at unbeatable prices."
            />
          </p>
          <p className="text-neutral-500 text-xs mt-2">
            WhatsApp:{' '}
            <EditableText settingKey="whatsapp_number" fallback="923001234567" />
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-neutral-900 mb-3">Policies</p>
          <div className="flex flex-col gap-2 text-sm text-neutral-600">
            <Link href="/policies/shipping" className="hover:text-neutral-900 transition-colors">
              Shipping Policy
            </Link>
            <Link href="/policies/returns" className="hover:text-neutral-900 transition-colors">
              Return &amp; Refund Policy
            </Link>
            <Link href="/policies/privacy" className="hover:text-neutral-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/policies/terms" className="hover:text-neutral-900 transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>

        <SubscribeForm />
      </div>

      <div className="border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 text-sm text-neutral-500 flex flex-col md:flex-row justify-between gap-2">
          <p>&copy; {new Date().getFullYear()} BaZariFy. All rights reserved.</p>
          <p className="text-neutral-500">Cash on Delivery available nationwide</p>
        </div>
      </div>
    </footer>
  );
}
