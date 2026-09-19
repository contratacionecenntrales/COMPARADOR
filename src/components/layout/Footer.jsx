import { Phone, Mail, MessageCircle, ShieldCheck } from 'lucide-react'
import logoIcon from '../../assets/brand/icc-icon.png'
import { COMPANY } from '../../lib/constants'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 bg-brand-navy text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <img src={logoIcon} alt="" className="h-9 w-9" />
              <span className="text-base font-bold text-white">{COMPANY.name}</span>
            </div>
            <p className="text-sm text-slate-400">
              Auditoría y comparación inteligente de servicios de energía, telefonía y alarmas. Ahorro
              real, respaldado por datos, sin compromiso.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-goldLight">
              Contacto directo
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-brand-gold" />
                <a href={`tel:${COMPANY.phone.replace(/\s+/g, '')}`} className="hover:text-white">
                  {COMPANY.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle size={16} className="text-brand-gold" />
                <a
                  href={`https://wa.me/${COMPANY.whatsapp.replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  WhatsApp: {COMPANY.whatsapp}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-brand-gold" />
                <a href={`mailto:${COMPANY.email}`} className="hover:text-white">
                  {COMPANY.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-goldLight">
              Compromiso Integral Connection
            </h4>
            <p className="flex items-start gap-2 text-sm text-slate-400">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-brand-gold" />
              Comparativas basadas en tarifas reales y actualizadas. Sin permanencia oculta, sin letra
              pequeña: te mostramos exactamente cuánto pagas hoy y cuánto pagarías con nosotros.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          © {year} {COMPANY.name}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
