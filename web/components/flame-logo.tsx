/**
 * The Flame in Freefall mark: a flame falling through an orbital ring.
 * Drawn rather than photographed so it stays sharp at any size. The ring
 * inherits `currentColor`, which keeps it legible on both the paper and
 * navy themes; the flame keeps its warm combustion hues in both.
 */
export function FlameLogo({
  className,
  title = "Flame in Freefall",
  decorative = false,
}: {
  className?: string;
  title?: string;
  decorative?: boolean;
}) {
  const label = decorative
    ? { "aria-hidden": true as const }
    : { role: "img", "aria-label": title };

  return (
    <svg viewBox="0 0 64 64" className={className} {...label}>
      {/* optical centring: the artwork spans y 3–43 in a 64 box */}
      <g transform="translate(0 6)">
        {/* back half of the ring, behind the flame */}
        <g transform="rotate(-18 32 34)">
          <path
            d="M 2 34 A 30 9 0 0 1 62 34"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.8"
            strokeLinecap="round"
            opacity="0.38"
          />
        </g>

        {/* the flame */}
        <path
          d="M32 3c1.6 7.4-2.2 10.6-5.4 13.6C23.2 20 20 23.4 20 29.6 20 37 25.4 43 32 43s12-6 12-13.4c0-6.6-4.4-10.2-7-14.6-1.6-2.8-2.6-6-5-9.4.3 5.6-1 8.6-2.6 11.2-.6-6.6 2.6-10.6 2.6-13.8Z"
          fill="#f97316"
        />
        <path
          d="M32 21.5c1.2 3.6-1.8 5.4-3.6 7.4-1.6 1.8-2.8 3.6-2.8 6.2 0 4 3 7 6.4 7s6.4-3 6.4-7c0-3.6-2.2-5.6-3.8-8-.9-1.4-1.6-3-2.6-4.8.2 3-.4 4.6-1.2 6-.2-2.8 1.2-4.4 1.2-6.8Z"
          fill="#fbbf24"
        />

        {/* front half of the ring, crossing the flame */}
        <g transform="rotate(-18 32 34)">
          <path
            d="M 2 34 A 30 9 0 0 0 62 34"
            fill="none"
            stroke="currentColor"
            strokeWidth="4.4"
            strokeLinecap="round"
            opacity="0.9"
          />
        </g>

        {/* the body falling along the ring */}
        <circle cx="51.5" cy="23.5" r="5.2" fill="#f97316" />
        <circle cx="49.8" cy="21.8" r="1.7" fill="#fed7aa" opacity="0.9" />
      </g>
    </svg>
  );
}
