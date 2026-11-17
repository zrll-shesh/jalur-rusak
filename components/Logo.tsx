export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 48" className={className} aria-hidden="true">
      <rect x="0" y="0" width="64" height="48" rx="5" fill="rgb(var(--sign))" />
      <rect x="0" y="36" width="64" height="12" fill="rgb(var(--hazard))" />
      <path d="M0 48l12-12h7L7 48zM15 48l12-12h7L22 48zM30 48l12-12h7L37 48zM45 48l12-12h7L52 48z" fill="#1C2321" />
      <rect x="0" y="36" width="64" height="12" fill="none" />
      <text x="32" y="27" textAnchor="middle" fontFamily="Overpass, sans-serif" fontWeight={900} fontSize="22" fill="#fff">
        M
      </text>
    </svg>
  );
}
