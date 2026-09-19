import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, RotateCcw, Loader2 } from 'lucide-react'
import Layout from '../components/layout/Layout'
import AuditReport from '../components/results/AuditReport'
import { useAudit } from '../context/AuditContext'
import { descargarInformePDF } from '../lib/pdf/generateReport'

export default function ResultsPage() {
  const navigate = useNavigate()
  const { state, reset } = useAudit()
  const [descargando, setDescargando] = useState(false)

  if (!state.resultado) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="text-xl font-semibold text-brand-navy">Todavía no hay ninguna auditoría generada</h1>
          <p className="mt-2 text-slate-500">Completa el asistente para ver tu comparativa de ahorro.</p>
          <button className="btn-primary mt-6" onClick={() => navigate('/comparador')}>
            Ir al comparador
          </button>
        </div>
      </Layout>
    )
  }

  async function handleDescargar() {
    setDescargando(true)
    try {
      await descargarInformePDF(state.resultado, state.cliente)
    } finally {
      setDescargando(false)
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-brand-navy">Resultado de la auditoría</h1>
            <p className="text-sm text-slate-500">Revisa el desglose y comparte el informe con el cliente.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                reset()
                navigate('/comparador')
              }}
              className="btn-ghost"
            >
              <RotateCcw size={16} /> Nueva auditoría
            </button>
            <button onClick={handleDescargar} disabled={descargando} className="btn-primary">
              {descargando ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
              Descargar PDF
            </button>
          </div>
        </div>

        <AuditReport resultado={state.resultado} clienteNombre={state.cliente.nombre} />
      </div>
    </Layout>
  )
}
