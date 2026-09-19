export function TextField({ label, suffix, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="input-label">{label}</label>}
      <div className="relative">
        <input className="input-field" {...props} />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function SelectField({ label, children, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="input-label">{label}</label>}
      <select className="select-field" {...props}>
        {children}
      </select>
    </div>
  )
}

export function ToggleField({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 hover:border-brand-gold/50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-brand-gold"
      />
      <span>
        <span className="block text-sm font-medium text-brand-navy">{label}</span>
        {description && <span className="block text-xs text-slate-500">{description}</span>}
      </span>
    </label>
  )
}
