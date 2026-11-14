/**
 * The Flame in Freefall mark: a flame falling through a ring. Drawn rather
 * than photographed so it stays sharp at any size and follows the theme.
 */
export function FlameLogo({
  className,
  title = "Flame in Freefall",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id="fif-flame" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="55%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id="fif-core" x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="fif-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="45%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      {/* back half of the ring */}
      <g transform="rotate(-18 32 34)">
        <path
          d="M 2 34 A 30 9 0 0 1 62 34"
          fill="none"
          stroke="url(#fif-ring)"
          strokeWidth="4.6"
          strokeLinecap="round"
        />
      </g>

      {/* the flame */}
      <path
        d="M32 3c1.6 7.4-2.2 10.6-5.4 13.6C23.2 20 20 23.4 20 29.6 20 37 25.4 43 32 43s12-6 12-13.4c0-6.6-4.4-10.2-7-14.6-1.6-2.8-2.6-6-5-9.4.3 5.6-1 8.6-2.6 11.2-.6-6.6 2.6-10.6 2.6-13.8Z"
        fill="url(#fif-flame)"
      />
      <path
        d="M32 21.5c1.2 3.6-1.8 5.4-3.6 7.4-1.6 1.8-2.8 3.6-2.8 6.2 0 4 3 7 6.4 7s6.4-3 6.4-7c0-3.6-2.2-5.6-3.8-8-.9-1.4-1.6-3-2.6-4.8.2 3-.4 4.6-1.2 6-.2-2.8 1.2-4.4 1.2-6.8Z"
        fill="url(#fif-core)"
      />

      {/* front half of the ring, crossing the flame */}
      <g transform="rotate(-18 32 34)">
        <path
          d="M 2 34 A 30 9 0 0 0 62 34"
          fill="none"
          stroke="url(#fif-ring)"
          strokeWidth="4.6"
          strokeLinecap="round"
        />
      </g>

      {/* the body falling along the ring */}
      <circle cx="51.5" cy="23.5" r="5.2" fill="#f97316" />
      <circle cx="49.8" cy="21.8" r="1.7" fill="#fed7aa" opacity="0.9" />
    </svg>
  );
}
