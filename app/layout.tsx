import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { CartProvider } from "@/lib/cart-context";
import { LanguageProvider } from "@/lib/language-context";
import { PowerEditorProvider } from "@/lib/power-editor-context";
import PowerEditorBanner from "@/components/PowerEditorBanner";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import AIAssistant from "@/components/AIAssistant";

export const metadata: Metadata = {
  title: {
    default: "BaZariFy — Quality Products at Unbeatable Prices",
    template: "%s | BaZariFy",
  },
  description:
    "Shop quality home, kitchen, electronics, beauty, and lifestyle products at BaZariFy. Cash on Delivery available nationwide.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://basera-bazar-lac.vercel.app"),
  openGraph: {
    title: "BaZariFy — Quality Products at Unbeatable Prices",
    description: "Shop quality products with Cash on Delivery, nationwide.",
    siteName: "BaZariFy",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400..700&family=Cormorant+Garamond:ital,wght@1,500;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-neutral-900 antialiased min-h-screen flex flex-col">
        <LanguageProvider>
          <PowerEditorProvider>
            <CartProvider>
              <PowerEditorBanner />
              <Nav />
              <main className="flex-1">{children}</main>
              <Footer />
              <FloatingWhatsApp />
              <AIAssistant />
            </CartProvider>
          </PowerEditorProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
