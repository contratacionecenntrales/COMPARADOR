import { Link, NavLink } from 'react-router-dom'
import { Phone, ShieldCheck } from 'lucide-react'
import logoIcon from '../../assets/brand/icc-icon.png'
import { COMPANY } from '../../lib/constants'

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-brand-gold' : 'text-slate-600 hover:text-brand-navy'}`

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center">
          <img src={logoIcon} alt={COMPANY.name} className="h-11 w-11 sm:h-12 sm:w-12" />
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
            className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-brand-navy sm:flex"
          >
            <Phone size={16} className="text-brand-gold" />
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
