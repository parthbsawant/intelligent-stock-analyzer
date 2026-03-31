function SectionContainer({ title, subtitle, rightContent, children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition-all duration-200 hover:shadow-lg ${className}`}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--color-primary)]">{title}</h2>
          {subtitle && <p className="mt-1 text-sm leading-5 text-slate-500">{subtitle}</p>}
        </div>
        {rightContent}
      </div>
      {children}
    </section>
  )
}

export default SectionContainer
