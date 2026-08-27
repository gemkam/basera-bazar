'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Language = 'en' | 'ur';

const translations: Record<string, Record<Language, string>> = {
  home: { en: 'Home', ur: 'ہوم' },
  allProducts: { en: 'All Products', ur: 'تمام پروڈکٹس' },
  admin: { en: 'Admin', ur: 'ایڈمن' },
  cart: { en: 'Cart', ur: 'کارٹ' },
  yourCart: { en: 'Your Cart', ur: 'آپ کی کارٹ' },
  cartEmpty: { en: 'Your Cart is Empty', ur: 'آپ کی کارٹ خالی ہے' },
  addSomeProducts: { en: 'Add some products to get started.', ur: 'شروع کرنے کے لیے کچھ پروڈکٹس شامل کریں۔' },
  browseProducts: { en: 'Browse Products', ur: 'پروڈکٹس دیکھیں' },
  subtotal: { en: 'Subtotal', ur: 'سب ٹوٹل' },
  proceedToCheckout: { en: 'Proceed to Checkout', ur: 'چیک آؤٹ کریں' },
  remove: { en: 'Remove', ur: 'ہٹائیں' },
  checkout: { en: 'Checkout', ur: 'چیک آؤٹ' },
  fullName: { en: 'Full Name', ur: 'پورا نام' },
  phoneNumber: { en: 'Phone Number', ur: 'فون نمبر' },
  emailAddress: { en: 'Email Address', ur: 'ای میل ایڈریس' },
  deliveryAddress: { en: 'Delivery Address', ur: 'ڈیلیوری ایڈریس' },
  city: { en: 'City', ur: 'شہر' },
  orderNotes: { en: 'Order Notes (optional)', ur: 'آرڈر نوٹس (اختیاری)' },
  paymentMethod: { en: 'Payment Method', ur: 'ادائیگی کا طریقہ' },
  cod: { en: 'Cash on Delivery (COD)', ur: 'ادائیگی ڈیلیوری پر (COD)' },
  placeOrder: { en: 'Place Order', ur: 'آرڈر کریں' },
  placingOrder: { en: 'Placing Order...', ur: 'آرڈر جاری ہے...' },
  orderSummary: { en: 'Order Summary', ur: 'آرڈر کا خلاصہ' },
  total: { en: 'Total', ur: 'کل رقم' },
  orderConfirmed: { en: 'Order Confirmed!', ur: 'آرڈر کی تصدیق ہو گئی!' },
  thankYou: {
    en: "Thank you for your order. We'll contact you shortly to confirm delivery.",
    ur: 'آپ کے آرڈر کا شکریہ۔ ہم جلد ہی ڈیلیوری کی تصدیق کے لیے رابطہ کریں گے۔',
  },
  continueShopping: { en: 'Continue Shopping', ur: 'خریداری جاری رکھیں' },
  addToCart: { en: 'Add to Cart', ur: 'کارٹ میں شامل کریں' },
  buyNow: { en: 'Buy Now', ur: 'ابھی خریدیں' },
  outOfStock: { en: 'Out of Stock', ur: 'اسٹاک ختم' },
  inStock: { en: 'In Stock', ur: 'دستیاب ہے' },
  sale: { en: 'SALE', ur: 'سیل' },
  ourCollections: { en: 'Our Collections', ur: 'ہمارا مجموعہ' },
  bestDeals: { en: 'Best Deals', ur: 'بہترین ڈیلز' },
  viewAll: { en: 'View all', ur: 'سب دیکھیں' },
  policies: { en: 'Policies', ur: 'پالیسیاں' },
  shippingPolicy: { en: 'Shipping Policy', ur: 'شپنگ پالیسی' },
  returnPolicy: { en: 'Return & Refund Policy', ur: 'واپسی اور رقم کی واپسی کی پالیسی' },
  privacyPolicy: { en: 'Privacy Policy', ur: 'رازداری کی پالیسی' },
  termsConditions: { en: 'Terms & Conditions', ur: 'شرائط و ضوابط' },
  subscribeOffers: { en: 'Subscribe for offers', ur: 'آفرز کے لیے سبسکرائب کریں' },
  yourEmail: { en: 'Your email', ur: 'آپ کا ای میل' },
  subscribe: { en: 'Subscribe', ur: 'سبسکرائب' },
  allRightsReserved: { en: 'All rights reserved.', ur: 'جملہ حقوق محفوظ ہیں۔' },
  codAvailable: { en: 'Cash on Delivery available nationwide', ur: 'ملک بھر میں کیش آن ڈیلیوری دستیاب ہے' },
};

type LanguageContextType = {
  language: Language;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations) => string;
  isRtl: boolean;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = 'bazarify-lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved === 'ur' || saved === 'en') setLanguage(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((l) => (l === 'en' ? 'ur' : 'en'));
  }, []);

  const t = useCallback(
    (key: keyof typeof translations) => translations[key]?.[language] || String(key),
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, isRtl: language === 'ur' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
