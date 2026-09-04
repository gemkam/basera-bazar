export default function ShippingPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-12 prose prose-sm">
      <h1 className="text-2xl font-bold mb-6"><span className="gold-gradient">Shipping Policy</span></h1>
      <p className="text-neutral-700 leading-relaxed">
        We aim to process and dispatch all orders within 1–3 business days. Delivery times may
        vary depending on your location, typically ranging from 2–7 business days.
      </p>
      <p className="text-neutral-700 leading-relaxed mt-4">
        Currently, we offer Cash on Delivery (COD) across all serviceable areas. You will be
        contacted via phone to confirm your order before it is dispatched.
      </p>
      <p className="text-neutral-700 leading-relaxed mt-4">
        Shipping charges, if any, will be clearly communicated at checkout or upon order
        confirmation.
      </p>
    </div>
  );
}
