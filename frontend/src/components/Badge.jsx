const badgeStyles = {
  BUY: 'border-green-200 bg-green-100 text-green-700 ring-green-100',
  SELL: 'border-red-200 bg-red-100 text-red-700 ring-red-100',
  HOLD: 'border-orange-200 bg-orange-100 text-orange-700 ring-orange-100',
}

function Badge({ label }) {
  const normalized = label?.toUpperCase() || 'HOLD'
  const styleClass = badgeStyles[normalized] || badgeStyles.HOLD

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ring-1 transition-all duration-200 motion-safe:animate-[fadeIn_180ms_ease-out] hover:-translate-y-[1px] hover:shadow-sm ${styleClass}`}
    >
      {normalized}
    </span>
  )
}

export default Badge
