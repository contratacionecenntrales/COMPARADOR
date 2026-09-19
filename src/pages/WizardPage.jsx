import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Stepper from '../components/common/Stepper'
import SectorSelector from '../components/wizard/SectorSelector'
import ClienteDataForm from '../components/wizard/ClienteDataForm'
import EnergyForm, { DEFAULT_LUZ, DEFAULT_GAS } from '../components/wizard/EnergyForm'
import TelephonyForm, { DEFAULT_TELEFONIA } from '../components/wizard/TelephonyForm'
import AlarmsForm, { DEFAULT_ALARMAS } from '../components/wizard/AlarmsForm'
import { useAudit } from '../context/AuditContext'
import { ejecutarAuditoria } from '../lib/auditEngine'
import { guardarAuditoria } from '../lib/dataService'
import { SECTORES, SECTOR_LABELS } from '../lib/constants'

const STEPS = ['Sector', 'Datos de la factura', 'Auditoría']

export default function WizardPage() {
  const navigate = useNavigate()
  const { state, setSector, setCliente, setEnergia, setTelefonia, setAlarmas, setResultado } = useAudit()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const puedeAvanzarPaso1 = Boolean(state.sector)

  function inicializarDatosSector() {
    const incluyeEnergia = state.sector === SECTORES.ENERGIA || state.sector === SECTORES.PACK_INTEGRAL
    const incluyeTelefonia = state.sector === SECTORES.TELEFONIA || state.sector === SECTORES.PACK_INTEGRAL
    const incluyeAlarmas = state.sector === SECTORES.ALARMAS || state.sector === SECTORES.PACK_INTEGRAL

    if (incluyeEnergia) {
      setEnergia({
        luz: state.energia.incluyeLuz && !state.energia.luz ? DEFAULT_LUZ : state.energia.luz,
        gas: state.energia.incluyeGas && !state.energia.gas ? DEFAULT_GAS : state.energia.gas,
      })
    }
    if (incluyeTelefonia && !state.telefonia) setTelefonia(DEFAULT_TELEFONIA)
    if (incluyeAlarmas && !state.alarmas) setAlarmas(DEFAULT_ALARMAS)
  }

  const puedeAvanzarPaso2 = (() => {
    if (state.sector === SECTORES.ENERGIA) return state.energia.incluyeLuz || state.energia.incluyeGas
    if (state.sector === SECTORES.TELEFONIA) return Boolean(state.telefonia)
    if (state.sector === SECTORES.ALARMAS) return Boolean(state.alarmas)
    if (state.sector === SECTORES.PACK_INTEGRAL) return true
    return false
  })()

  async function procesarAuditoria() {
    setLoading(true)
    setError(null)
    try {
      const resultado = await ejecutarAuditoria(state)
      setResultado(resultado)

      await guardarAuditoria({
        sector: state.sector,
        cliente_nombre: state.cliente.nombre || null,
        cliente_email: state.cliente.email || null,
        cliente_telefono: state.cliente.telefono || null,
        datos_entrada: state,
        resultado,
        coste_actual_anual: resultado.totales.costeActualAnual,
        coste_propuesto_anual: resultado.totales.costePropuestaAnual,
        ahorro_anual: resultado.totales.ahorroAnual,
        ahorro_porcentaje: resultado.totales.ahorroPorcentaje,
      })

      navigate('/resultados')
    } catch (err) {
      console.error(err)
      setError('No se ha podido calcular la auditoría. Revisa los datos introducidos e inténtalo de nuevo.')
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Stepper steps={STEPS} current={step} />

        <div className="mt-10">
          {step === 1 && (
            <div className="space-y-8 animate-[fadeIn_.2s_ease]">
              <div>
                <h1 className="text-2xl font-bold text-brand-navy">¿Qué quieres auditar hoy?</h1>
                <p className="mt-1 text-slate-500">Selecciona el sector y déjanos los datos de contacto del cliente.</p>
              </div>
              <SectorSelector value={state.sector} onSelect={setSector} />
              <div className="card">
                <h3 className="mb-4 text-base font-semibold text-brand-navy">Datos del cliente (opcional)</h3>
                <ClienteDataForm cliente={state.cliente} onChange={setCliente} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-brand-navy">{SECTOR_LABELS[state.sector]}</h1>
                <p className="mt-1 text-slate-500">Introduce los datos de la factura actual del cliente.</p>
              </div>

              {(state.sector === SECTORES.ENERGIA || state.sector === SECTORES.PACK_INTEGRAL) && (
                <EnergyForm energia={state.energia} onChange={setEnergia} />
              )}

              {(state.sector === SECTORES.TELEFONIA || state.sector === SECTORES.PACK_INTEGRAL) && (
                <TelephonyForm telefonia={state.telefonia || DEFAULT_TELEFONIA} onChange={setTelefonia} />
              )}

              {(state.sector === SECTORES.ALARMAS || state.sector === SECTORES.PACK_INTEGRAL) && (
                <AlarmsForm alarmas={state.alarmas || DEFAULT_ALARMAS} onChange={setAlarmas} />
              )}
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <Loader2 className="animate-spin text-brand-gold" size={40} />
              <p className="text-slate-600">Calculando el desglose y comparando con nuestras tarifas activas…</p>
            </div>
          )}

          {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}

          {step !== 3 && (
            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                className="btn-ghost"
              >
                <ArrowLeft size={16} /> Atrás
              </button>

              {step === 1 && (
                <button
                  type="button"
                  disabled={!puedeAvanzarPaso1}
                  onClick={() => {
                    inicializarDatosSector()
                    setStep(2)
                  }}
                  className="btn-primary"
                >
                  Continuar <ArrowRight size={16} />
                </button>
              )}

              {step === 2 && (
                <button
                  type="button"
                  disabled={!puedeAvanzarPaso2 || loading}
                  onClick={async () => {
                    setStep(3)
                    await procesarAuditoria()
                  }}
                  className="btn-primary"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
                  Generar auditoría de ahorro
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
