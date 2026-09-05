"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  endTime: Date | string; // when the sale ends
  label?: string;
}

/**
 * Countdown timer for flash sales / limited-time deals. Creates urgency.
 *
 * Usage:
 *   <CountdownTimer endTime={new Date(Date.now() + 1000 * 60 * 60 * 6)} label="Flash Sale Ends In" />
 */
export default function CountdownTimer({ endTime, label = "Sale Ends In" }: CountdownTimerProps) {
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
      <span className="font-bold text-sm tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
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
