import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { CartProvider } from "@/lib/cart-context";
import { PowerEditorProvider } from "@/lib/power-editor-context";
import PowerEditorBanner from "@/components/PowerEditorBanner";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

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
      <body className="bg-black text-white antialiased min-h-screen flex flex-col">
        <PowerEditorProvider>
          <CartProvider>
            <PowerEditorBanner />
            <Nav />
            <main className="flex-1">{children}</main>
            <Footer />
            <FloatingWhatsApp />
          </CartProvider>
        </PowerEditorProvider>
      </body>
    </html>
  );
}
