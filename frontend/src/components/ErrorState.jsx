import Button from './Button'

function ErrorState({ title = 'Something went wrong', message, actionLabel = 'Retry', onAction, className = '' }) {
  return (
    <div className={`rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900 ${className}`} role="alert">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          {message ? <p className="mt-1 text-sm text-rose-800/90">{message}</p> : null}
        </div>
        {typeof onAction === 'function' ? (
          <Button type="button" variant="danger" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export default ErrorState
