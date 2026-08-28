'use client';

export default function KineticText({
  text,
  className,
  baseDelay = 0,
  staggerMs = 60,
}: {
  text: string;
  className?: string;
  baseDelay?: number;
  staggerMs?: number;
}) {
  const words = text.split(' ');

  return (
    <span className={`inline-block ${className || ''}`}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.28em]">
          <span
            className="inline-block kinetic-word"
            style={{ animationDelay: `${baseDelay + i * staggerMs}ms` }}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}
