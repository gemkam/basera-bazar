"use client";

import { useEffect, useState } from "react";
import ScrollReveal from "./ScrollReveal";

interface Review {
  name: string;
  location: string;
  rating: number; // 1-5
  text: string;
  avatarInitial: string;
}

const defaultReviews: Review[] = [
  {
    name: "Ayesha K.",
    location: "Lahore",
    rating: 5,
    text: "Ordered a perfume and it arrived in 2 days. Packaging was excellent, exactly as shown!",
    avatarInitial: "A",
  },
  {
    name: "Bilal M.",
    location: "Karachi",
    rating: 5,
    text: "Cash on delivery made it so easy to trust. Will definitely order again.",
    avatarInitial: "B",
  },
  {
    name: "Sana R.",
    location: "Multan",
    rating: 4,
    text: "Good quality products at fair prices. Customer support responded quickly on WhatsApp.",
    avatarInitial: "S",
  },
  {
    name: "Usman T.",
    location: "Islamabad",
    rating: 5,
    text: "Best online shopping experience I've had. Fast delivery and great quality.",
    avatarInitial: "U",
  },
];

/**
 * Auto-rotating testimonials carousel. Advances every 4.5s, pauses on hover.
 * Replace `defaultReviews` with real customer reviews as they come in.
 */
export default function Testimonials({ reviews = defaultReviews }: { reviews?: Review[] }) {
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
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          What Our Customers Say
        </h2>
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

        <p className="text-lg italic mb-4">"{review.text}"</p>

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
