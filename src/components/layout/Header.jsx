import { Link, NavLink } from 'react-router-dom'
import { Phone, ShieldCheck } from 'lucide-react'
import logoHorizontal from '../../assets/brand/icc-logo-horizontal.png'
import { COMPANY } from '../../lib/constants'

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-brand-gold' : 'text-slate-200 hover:text-white'}`

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-navy-gradient shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoHorizontal} alt={COMPANY.name} className="h-9 w-auto sm:h-10" />
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
