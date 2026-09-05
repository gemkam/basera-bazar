"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

/* ============================================================
   ScrollReveal — fade/slide-in wrapper for scroll animations
   ============================================================ */

type Direction = "up" | "left" | "right" | "fade";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setVisible(true), delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delay]);

  const hiddenTransform =
    direction === "up"
      ? "translateY(40px)"
      : direction === "left"
      ? "translateX(-40px)"
      : direction === "right"
      ? "translateX(40px)"
      : "translateY(0)";

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate(0, 0)" : hiddenTransform,
        transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

/* ============================================================
   TrustBadges — row of trust indicators under the hero
   ============================================================ */

interface Badge {
  icon: string;
  label: string;
}

const defaultBadges: Badge[] = [
  { icon: "🚚", label: "Cash on Delivery" },
  { icon: "↩️", label: "Easy Returns" },
  { icon: "🛡️", label: "100% Original Products" },
  { icon: "💬", label: "24/7 Support" },
];

export function TrustBadges({ badges = defaultBadges }: { badges?: Badge[] }) {
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

/* ============================================================
   StatsCounter — animated count-up stats bar
   ============================================================ */

interface Stat {
  label: string;
  value: number;
  suffix?: string;
}

export function StatsCounter({ stats }: { stats: Stat[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStarted(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="grid grid-cols-2 md:grid-cols-4 gap-6 py-10 px-4">
      {stats.map((stat, i) => (
        <CountUpItem key={i} stat={stat} started={started} />
      ))}
    </div>
  );
}

function CountUpItem({ stat, started }: { stat: Stat; started: boolean }) {
  const [display, setDisplay] = useState(0);
  const duration = 1800;

  useEffect(() => {
    if (!started) return;
    const isDecimal = !Number.isInteger(stat.value);
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = stat.value * eased;
      setDisplay(isDecimal ? Math.round(current * 10) / 10 : Math.floor(current));
      if (progress < 1) requestAnimationFrame(step);
      else setDisplay(stat.value);
    };

    requestAnimationFrame(step);
  }, [started, stat.value]);

  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold">
        {display.toLocaleString()}
        {stat.suffix ?? ""}
      </div>
      <div className="text-sm mt-1 opacity-80">{stat.label}</div>
    </div>
  );
}

/* ============================================================
   HowItWorks — 4-step process section
   ============================================================ */

interface Step {
  icon: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  { icon: "🔍", title: "Browse", description: "Explore products across all categories" },
  { icon: "🛒", title: "Order", description: "Add to cart and checkout in seconds" },
  { icon: "💵", title: "Pay on Delivery", description: "No advance payment needed" },
  { icon: "📦", title: "Get Delivered", description: "Fast delivery nationwide" },
];

export function HowItWorks() {
  return (
    <section className="py-14 px-4">
      <ScrollReveal direction="up">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">How It Works</h2>
      </ScrollReveal>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {steps.map((step, i) => (
          <ScrollReveal key={i} direction="up" delay={i * 150}>
            <div className="flex flex-col items-center text-center p-4 rounded-xl transition-transform duration-300 hover:-translate-y-2">
              <div className="text-4xl mb-3">{step.icon}</div>
              <h3 className="font-semibold mb-1">{step.title}</h3>
              <p className="text-sm opacity-75">{step.description}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   WhyChooseUs — 4-card feature grid
   ============================================================ */

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  { icon: "🚀", title: "Fast Delivery", description: "Nationwide delivery with real-time order updates" },
  { icon: "🔒", title: "Secure & Trusted", description: "Cash on delivery means you pay only when you receive" },
  { icon: "↩️", title: "Easy Returns", description: "Hassle-free returns within our policy window" },
  { icon: "🎧", title: "24/7 Support", description: "Reach us anytime on WhatsApp for help with your order" },
];

export function WhyChooseUs() {
  return (
    <section className="py-14 px-4">
      <ScrollReveal direction="up">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Why Choose BaZariFy</h2>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {features.map((f, i) => (
          <ScrollReveal key={i} direction="up" delay={i * 120}>
            <div className="p-6 rounded-2xl border text-center h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm opacity-75">{f.description}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   Testimonials — auto-rotating review carousel
   ============================================================ */

interface Review {
  name: string;
  location: string;
  rating: number;
  text: string;
  avatarInitial: string;
}

const defaultReviews: Review[] = [
  { name: "Ayesha K.", location: "Lahore", rating: 5, text: "Ordered a perfume and it arrived in 2 days. Packaging was excellent, exactly as shown!", avatarInitial: "A" },
  { name: "Bilal M.", location: "Karachi", rating: 5, text: "Cash on delivery made it so easy to trust. Will definitely order again.", avatarInitial: "B" },
  { name: "Sana R.", location: "Multan", rating: 4, text: "Good quality products at fair prices. Customer support responded quickly on WhatsApp.", avatarInitial: "S" },
  { name: "Usman T.", location: "Islamabad", rating: 5, text: "Best online shopping experience I've had. Fast delivery and great quality.", avatarInitial: "U" },
];

export function Testimonials({ reviews = defaultReviews }: { reviews?: Review[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % reviews.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [paused, reviews.length]);

  const review = reviews[index];

  return (
    <section className="py-14 px-4">
      <ScrollReveal direction="up">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">What Our Customers Say</h2>
      </ScrollReveal>

      <div
        className="max-w-xl mx-auto text-center transition-all duration-500"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold border">
            {review.avatarInitial}
          </div>
        </div>

        <div className="mb-3" aria-label={`${review.rating} out of 5 stars`}>
          {"★".repeat(review.rating)}
          {"☆".repeat(5 - review.rating)}
        </div>

        <p className="text-lg italic mb-4">&quot;{review.text}&quot;</p>

        <p className="font-semibold">
          {review.name} <span className="opacity-60 font-normal">— {review.location}</span>
        </p>

        <div className="flex justify-center gap-2 mt-6">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to review ${i + 1}`}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: "currentColor",
                opacity: i === index ? 1 : 0.3,
                transform: i === index ? "scale(1.4)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   CountdownTimer — urgency timer for sales
   ============================================================ */

interface CountdownTimerProps {
  endTime: Date | string;
  label?: string;
}

export function CountdownTimer({ endTime, label = "Sale Ends In" }: CountdownTimerProps) {
  const target = typeof endTime === "string" ? new Date(endTime) : endTime;
  const [remaining, setRemaining] = useState(getRemaining(target));

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(getRemaining(target));
    }, 1000);
    return () => clearInterval(timer);
  }, [target]);

  if (remaining.total <= 0) {
    return <div className="text-sm font-medium opacity-70">Sale ended</div>;
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium opacity-80">{label}</span>
      <div className="flex gap-2">
        <TimeBox value={remaining.hours} unit="h" />
        <TimeBox value={remaining.minutes} unit="m" />
        <TimeBox value={remaining.seconds} unit="s" />
      </div>
    </div>
  );
}

function TimeBox({ value, unit }: { value: number; unit: string }) {
  return (
    <div className="flex flex-col items-center px-2 py-1 rounded-md border min-w-[2.5rem]">
      <span className="font-bold text-sm tabular-nums">{String(value).padStart(2, "0")}</span>
      <span className="text-[10px] opacity-60">{unit}</span>
    </div>
  );
}

function getRemaining(target: Date) {
  const total = target.getTime() - Date.now();
  if (total <= 0) return { total: 0, hours: 0, minutes: 0, seconds: 0 };
  const hours = Math.floor(total / (1000 * 60 * 60));
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);
  return { total, hours, minutes, seconds };
}