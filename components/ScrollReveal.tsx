"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

type Direction = "up" | "left" | "right" | "fade";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number; // milliseconds
  className?: string;
}

/**
 * Wrap any section/element with this to make it fade/slide in as the
 * user scrolls to it. No external animation library needed — uses
 * IntersectionObserver + CSS transitions only.
 *
 * Usage:
 *   <ScrollReveal direction="up">
 *     <YourSection />
 *   </ScrollReveal>
 */
export default function ScrollReveal({
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
