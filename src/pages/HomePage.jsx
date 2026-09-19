import { Link } from 'react-router-dom'
import { Zap, Smartphone, ShieldCheck, ArrowRight, BadgeCheck } from 'lucide-react'
import Layout from '../components/layout/Layout'
import logoIcon from '../assets/brand/icc-icon.png'
import { COMPANY } from '../lib/constants'

const VENTAJAS = [
  { icon: Zap, titulo: 'Energía', texto: 'Auditamos tu factura de luz y gas periodo a periodo (P1, P2, P3) frente a nuestras mejores tarifas activas.' },
  { icon: Smartphone, titulo: 'Telefonía', texto: 'Móvil, fibra y paquetes convergentes: igualamos o mejoramos tus prestaciones bajando el precio.' },
  { icon: ShieldCheck, titulo: 'Alarmas', texto: 'Comparamos tu cuota de seguridad actual con nuestros kits de protección, sin perder cobertura.' },
]

export default function HomePage() {
  return (
    <Layout>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <img src={logoIcon} alt="" className="mx-auto mb-6 h-16 w-16" />
            <p className="mb-3 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-widest text-brand-goldDark">
              <BadgeCheck size={16} /> Comparador y Auditor Inteligente de Servicios
            </p>
            <h1 className="text-3xl font-extrabold leading-tight text-brand-navy sm:text-5xl">
              Descubre cuánto puedes ahorrar en energía, telefonía y alarmas
            </h1>
            <p className="mt-5 text-lg text-slate-600">
              {COMPANY.name} audita tu factura actual y te muestra, en minutos, el ahorro exacto en euros y
              en porcentaje frente a nuestras tarifas.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/comparador" className="btn-primary text-base">
                Empezar auditoría gratuita <ArrowRight size={18} />
              </Link>
              <a href={`tel:${COMPANY.phone.replace(/\s+/g, '')}`} className="btn-outline text-base">
                Llamar: {COMPANY.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {VENTAJAS.map(({ icon: Icon, titulo, texto }) => (
            <div key={titulo} className="card">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-goldDark">
                <Icon size={22} />
              </div>
              <h3 className="mb-2 text-base font-semibold text-brand-navy">{titulo}</h3>
              <p className="text-sm text-slate-500">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-brand-navy">¿Cómo funciona?</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-4">
            {[
              ['1', 'Elige el sector', 'Energía, telefonía, alarmas o Pack Integral.'],
              ['2', 'Introduce tu factura', 'Rellena los datos guiados de tu factura actual.'],
              ['3', 'Recibe tu auditoría', 'Vemos el desglose y ahorro exacto en euros y %.'],
              ['4', 'Contrata al instante', 'Descarga el PDF o contáctanos para cerrarlo ya.'],
            ].map(([num, titulo, texto]) => (
              <div key={num}>
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold-gradient font-bold text-brand-navy">
                  {num}
                </div>
                <h4 className="text-sm font-semibold text-brand-navy">{titulo}</h4>
                <p className="mt-1 text-xs text-slate-500">{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}
