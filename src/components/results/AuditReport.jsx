import SavingsHero from './SavingsHero'
import EnergyBreakdown from './EnergyBreakdown'
import TelephonyBreakdown from './TelephonyBreakdown'
import AlarmsBreakdown from './AlarmsBreakdown'
import ContactCTA from './ContactCTA'

export default function AuditReport({ resultado, clienteNombre, reportRef }) {
  if (!resultado) return null

  return (
    <div ref={reportRef} className="space-y-8">
      <SavingsHero totales={resultado.totales} clienteNombre={clienteNombre} />
      <EnergyBreakdown energia={resultado.energia} />
      <TelephonyBreakdown telefonia={resultado.telefonia} />
      <AlarmsBreakdown alarmas={resultado.alarmas} />
      <ContactCTA />
    </div>
  )
}
