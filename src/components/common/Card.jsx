export default function Card({ children, className = '', title, subtitle, icon: Icon }) {
  return (
    <div className={`card ${className}`}>
      {(title || Icon) && (
        <div className="mb-4 flex items-center gap-3">
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-goldDark">
              <Icon size={20} />
            </div>
          )}
          <div>
            {title && <h3 className="text-base font-semibold text-brand-navy">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}
