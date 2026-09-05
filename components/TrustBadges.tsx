"use client";

interface Badge {
  icon: string; // emoji or path to svg, kept simple/dependency-free
  label: string;
}

const defaultBadges: Badge[] = [
  { icon: "🚚", label: "Cash on Delivery" },
  { icon: "↩️", label: "Easy Returns" },
  { icon: "🛡️", label: "100% Original Products" },
  { icon: "💬", label: "24/7 Support" },
];

/**
 * A row of trust badges shown right under the hero. Cheap to build,
 * high impact on buyer confidence.
 *
 * Usage:
 *   <TrustBadges />
 *   or
 *   <TrustBadges badges={[{icon:"🚚", label:"Fast Shipping"}, ...]} />
 */
export default function TrustBadges({ badges = defaultBadges }: { badges?: Badge[] }) {
  return (
    <div className="w-full py-6 px-4">
      <div className="flex flex-wrap justify-center gap-6 md:gap-12">
        {badges.map((b, i) => (
          <div
            key={i}
            className="flex items-center gap-2 transition-transform duration-300 hover:scale-105"
          >
            <span className="text-2xl">{b.icon}</span>
            <span className="text-sm font-medium">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
