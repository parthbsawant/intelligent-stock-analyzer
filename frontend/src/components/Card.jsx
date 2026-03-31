function Card({ title, children, className = '' }) {
  return (
    <article
      className={`group rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg focus-within:shadow-lg ${className}`}
    >
      {title ? (
        <div className="mb-4 border-b border-slate-100 pb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
        </div>
      ) : null}
      <div className="mt-0">{children}</div>
    </article>
  )
}

export default Card
