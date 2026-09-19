import { Phone, MessageCircle, Mail } from 'lucide-react'
import { COMPANY } from '../../lib/constants'
import logoIcon from '../../assets/brand/icc-icon.png'

export default function ContactCTA() {
  return (
    <div className="rounded-2xl border-2 border-brand-gold/40 bg-white p-6 text-center shadow-gold sm:p-8">
      <img src={logoIcon} alt="" className="mx-auto mb-3 h-12 w-12" />
      <h3 className="text-lg font-bold text-brand-navy">¿Quieres cerrar este ahorro ahora?</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
        Un asesor de {COMPANY.name} puede formalizar el cambio hoy mismo, sin coste y sin que tengas que hacer
        ninguna gestión.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <a href={`tel:${COMPANY.phone.replace(/\s+/g, '')}`} className="btn-primary">
          <Phone size={16} /> Llamar ahora · {COMPANY.phone}
        </a>
        <a
          href={`https://wa.me/${COMPANY.whatsapp.replace(/[^\d]/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary"
        >
          <MessageCircle size={16} /> WhatsApp
        </a>
        <a href={`mailto:${COMPANY.email}`} className="btn-outline">
          <Mail size={16} /> Email
        </a>
      </div>
    </div>
  )
}
