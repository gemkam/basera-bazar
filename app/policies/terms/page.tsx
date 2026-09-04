export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-12 prose prose-sm">
      <h1 className="text-2xl font-bold mb-6"><span className="gold-gradient">Terms & Conditions</span></h1>
      <p className="text-neutral-700 leading-relaxed">
        By using BaZariFy, you agree to purchase products for personal use in accordance with
        applicable laws. All product descriptions, images, and prices are provided in good faith
        and are subject to change without prior notice.
      </p>
      <p className="text-neutral-700 leading-relaxed mt-4">
        Orders placed on Cash on Delivery (COD) must be paid in full at the time of delivery.
        Repeated refusal of COD orders may result in restricted access to future orders.
      </p>
      <p className="text-neutral-700 leading-relaxed mt-4">
        We reserve the right to cancel any order due to stock unavailability, pricing errors, or
        suspected fraudulent activity.
      </p>
    </div>
  );
}
