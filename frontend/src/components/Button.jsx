function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  children,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-md font-semibold outline-none transition-all duration-200 select-none ' +
    'focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white ' +
    'disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.99]'

  const variants = {
    primary:
      'bg-[var(--color-secondary)] text-white shadow-sm hover:shadow hover:opacity-95 active:opacity-90',
    secondary:
      'bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:bg-slate-900',
    outline:
      'border border-slate-300 bg-white text-[var(--color-primary)] hover:bg-slate-50 hover:border-slate-400',
    ghost: 'bg-transparent text-[var(--color-primary)] hover:bg-slate-100',
    danger:
      'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  }

  const variantClass = variants[variant] || variants.primary
  const sizeClass = sizes[size] || sizes.md

  return (
    <Component className={`${base} ${variantClass} ${sizeClass} ${className}`} disabled={disabled} {...props}>
      {children}
    </Component>
  )
}

export default Button
