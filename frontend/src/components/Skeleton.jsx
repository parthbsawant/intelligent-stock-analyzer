function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-slate-200/80 ${className}`} aria-hidden="true" />
}

function SkeletonText({ lines = 2, className = '' }) {
  const safeLines = Math.max(1, Math.min(6, Number(lines) || 2))
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: safeLines }).map((_, idx) => (
        <Skeleton key={idx} className={`h-3 ${idx === safeLines - 1 ? 'w-3/5' : 'w-full'}`} />
      ))}
    </div>
  )
}

export { Skeleton, SkeletonText }
