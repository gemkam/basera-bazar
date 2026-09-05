"use client";

import { useEffect, useRef, useState } from "react";

interface Stat {
  label: string;
  value: number; // final number to count up to
  suffix?: string; // e.g. "+", "★", "%"
}

interface StatsCounterProps {
  stats: Stat[];
}

/**
 * A row of stats (e.g. "10,000+ Orders Delivered") that count up from 0
 * once the section scrolls into view. Pure React state + requestAnimationFrame,
 * no dependencies.
 *
 * Usage:
 *   <StatsCounter
 *     stats={[
 *       { label: "Orders Delivered", value: 10000, suffix: "+" },
 *       { label: "Happy Customers", value: 8500, suffix: "+" },
 *       { label: "Average Rating", value: 4.8, suffix: "★" },
 *       { label: "Cities Covered", value: 50, suffix: "+" },
 *     ]}
 *   />
 */
export default function StatsCounter({ stats }: StatsCounterProps) {
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
    <div
      ref={sectionRef}
      className="grid grid-cols-2 md:grid-cols-4 gap-6 py-10 px-4"
    >
      {stats.map((stat, i) => (
        <CountUpItem key={i} stat={stat} started={started} />
      ))}
    </div>
  );
}

function CountUpItem({ stat, started }: { stat: Stat; started: boolean }) {
  const [display, setDisplay] = useState(0);
  const duration = 1800; // ms

  useEffect(() => {
    if (!started) return;
    const isDecimal = !Number.isInteger(stat.value);
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out cubic
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
