export function Logo({ className = '' }) {
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gov-gradient text-[10px] font-bold text-white ${className}`}
      role="img"
      aria-label="India"
    >
      🇮🇳
    </span>
  )
}
