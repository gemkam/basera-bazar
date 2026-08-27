export default function Footer() {
  return (
    <footer className="border-t border-neutral-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 text-sm text-neutral-500 flex flex-col md:flex-row justify-between gap-4">
        <p>&copy; {new Date().getFullYear()} Basera Bazaar. All rights reserved.</p>
        <p className="text-neutral-600">Quality products at unbeatable prices</p>
      </div>
    </footer>
  );
}
