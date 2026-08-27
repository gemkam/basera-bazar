import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { CartProvider } from "@/lib/cart-context";
import { PowerEditorProvider } from "@/lib/power-editor-context";
import PowerEditorBanner from "@/components/PowerEditorBanner";

export const metadata: Metadata = {
  title: "BaZariFy",
  description: "Quality products at unbeatable prices",
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
          </CartProvider>
        </PowerEditorProvider>
      </body>
    </html>
  );
}
