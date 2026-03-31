function Loader({ text = 'Loading data...' }) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-600">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[var(--color-secondary)]" />
      <span>{text}</span>
    </div>
  )
}

export default Loader
