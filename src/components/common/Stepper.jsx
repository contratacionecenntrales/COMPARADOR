import { Check } from 'lucide-react'

export default function Stepper({ steps, current }) {
  return (
    <ol className="mx-auto flex max-w-3xl items-center justify-between">
      {steps.map((label, idx) => {
        const stepNum = idx + 1
        const isDone = stepNum < current
        const isActive = stepNum === current
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                  isDone
                    ? 'border-brand-gold bg-brand-gold text-brand-navy'
                    : isActive
                    ? 'border-brand-gold text-brand-gold'
                    : 'border-slate-300 text-slate-400'
                }`}
              >
                {isDone ? <Check size={16} /> : stepNum}
              </div>
              <span
                className={`hidden text-xs font-medium sm:block ${
                  isActive ? 'text-brand-navy' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
            {stepNum !== steps.length && (
              <div className={`mx-2 h-0.5 flex-1 ${isDone ? 'bg-brand-gold' : 'bg-slate-200'}`} />
            )}
          </li>
        )
      })}
    </ol>
  )
}
