import Link from 'next/link';
import SubscribeForm from './SubscribeForm';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <p className="font-bold text-lg mb-2">
            Basera <span className="gold-gradient">Bazaar</span>
          </p>
          <p className="text-neutral-500 text-sm">Quality products at unbeatable prices.</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-white mb-3">Policies</p>
          <div className="flex flex-col gap-2 text-sm text-neutral-400">
            <Link href="/policies/shipping" className="hover:text-white transition-colors">
              Shipping Policy
            </Link>
            <Link href="/policies/returns" className="hover:text-white transition-colors">
              Return &amp; Refund Policy
            </Link>
            <Link href="/policies/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/policies/terms" className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>

        <SubscribeForm />
      </div>

      <div className="border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 text-sm text-neutral-500 flex flex-col md:flex-row justify-between gap-2">
          <p>&copy; {new Date().getFullYear()} Basera Bazaar. All rights reserved.</p>
          <p className="text-neutral-600">Cash on Delivery available nationwide</p>
        </div>
      </div>
    </footer>
  );
}
