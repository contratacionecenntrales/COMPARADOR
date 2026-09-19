import { Link, NavLink } from 'react-router-dom'
import { Phone, ShieldCheck } from 'lucide-react'
import logoIcon from '../../assets/brand/icc-icon.png'
import { COMPANY } from '../../lib/constants'

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-brand-gold' : 'text-slate-200 hover:text-white'}`

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-navy-gradient shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoIcon} alt="" className="h-9 w-9 sm:h-10 sm:w-10" />
          <span className="leading-tight">
            <span className="block text-sm font-bold text-white sm:text-base">
              Integral <span className="text-brand-goldLight">Connection</span>
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-slate-300 sm:text-xs">
              Consulting
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Inicio
          </NavLink>
          <NavLink to="/comparador" className={navLinkClass}>
            Comparador
          </NavLink>
          <NavLink to="/admin" className={navLinkClass}>
            Panel interno
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${COMPANY.phone.replace(/\s+/g, '')}`}
            className="hidden items-center gap-2 rounded-lg border border-brand-gold/40 bg-white/5 px-3 py-1.5 text-sm font-semibold text-brand-goldLight sm:flex"
          >
            <Phone size={16} />
            {COMPANY.phone}
          </a>
          <Link to="/comparador" className="btn-primary !px-4 !py-2 text-sm">
            <ShieldCheck size={16} />
            Auditar mi factura
          </Link>
        </div>
      </div>
    </header>
  )
}
