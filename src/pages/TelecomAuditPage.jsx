import { useEffect, useState } from 'react'
import { Loader2, Plus, Trash2, Download, LogOut } from 'lucide-react'
import Layout from '../components/layout/Layout'
import AdminLogin from '../components/admin/AdminLogin'
import { TextField, SelectField } from '../components/common/Field'
import { obtenerUsuarioActual, cerrarSesion } from '../lib/authService'
import { listarTarifas, guardarAuditoria } from '../lib/dataService'
import { ejecutarAuditoriaTelecom, DIAGNOSTICOS_FACTURA, crearConceptoVacio, crearHallazgoVacio } from '../lib/calculations/telecomAudit'
import { descargarInformeTelecomPDF } from '../lib/pdf/generateTelecomAuditReport'
import { formatEUR } from '../lib/format'

const CLIENTE_VACIO = { nombre: '', ubicacion: '', operadorActual: '', periodoFactura: '' }

export default function TelecomAuditPage() {
  const [usuario, setUsuario] = useState(undefined)
  const [mercado, setMercado] = useState([])
  const [cargandoMercado, setCargandoMercado] = useState(true)

  const [cliente, setCliente] = useState(CLIENTE_VACIO)
  const [conceptos, setConceptos] = useState([crearConceptoVacio()])
  const [hallazgos, setHallazgos] = useState([crearHallazgoVacio(), crearHallazgoVacio(), crearHallazgoVacio()])
  const [operadorRecomendadoId, setOperadorRecomendadoId] = useState('')
  const [generando, setGenerando] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(false)

  useEffect(() => {
    obtenerUsuarioActual().then(setUsuario)
  }, [])

  useEffect(() => {
    if (!usuario) return
    listarTarifas('mercado')
      .then(setMercado)
      .finally(() => setCargandoMercado(false))
  }, [usuario])

  if (usuario === undefined) {
    return (
      <Layout>
        <div className="flex items-center justify-center gap-2 py-24 text-slate-500">
          <Loader2 className="animate-spin" size={18} /> Comprobando sesión…
        </div>
      </Layout>
    )
  }

  if (!usuario) {
    return (
      <Layout>
        <AdminLogin onLoggedIn={setUsuario} />
      </Layout>
    )
  }

  const costeActualMensual = conceptos.reduce((sum, c) => sum + (Number(c.importeMes) || 0), 0)

  function actualizarConcepto(idx, patch) {
    setConceptos((cs) => cs.map((c, i) => (i === idx ? { ...c, ...patch } : c)))
  }
  function anadirConcepto() {
    setConceptos((cs) => [...cs, crearConceptoVacio()])
  }
  function quitarConcepto(idx) {
    setConceptos((cs) => cs.filter((_, i) => i !== idx))
  }
  function actualizarHallazgo(idx, patch) {
    setHallazgos((hs) => hs.map((h, i) => (i === idx ? { ...h, ...patch } : h)))
  }

  async function handleGenerar() {
    setError(null)
    setExito(false)
    if (!cliente.nombre.trim()) {
      setError('Introduce al menos el nombre del cliente.')
      return
    }
    if (conceptos.every((c) => !c.concepto.trim())) {
      setError('Añade al menos un concepto de la factura actual.')
      return
    }
    setGenerando(true)
    try {
      const resultado = ejecutarAuditoriaTelecom(
        {
          cliente,
          conceptos,
          hallazgos,
          operadorRecomendadoId: operadorRecomendadoId ? Number(operadorRecomendadoId) : null,
          consultor: { nombre: usuario.nombre || usuario.email, email: usuario.email },
        },
        mercado
      )

      await descargarInformeTelecomPDF(resultado)

      await guardarAuditoria({
        sector: 'telefonia',
        cliente_nombre: cliente.nombre || null,
        cliente_email: null,
        cliente_telefono: null,
        datos_entrada: { tipoInforme: 'telecom_avanzada', cliente, conceptos, hallazgos, operadorRecomendadoId },
        resultado: { tipoInforme: 'telecom_avanzada', ...resultado },
        coste_actual_anual: resultado.costeActualAnual,
        coste_propuesto_anual: resultado.recomendado ? resultado.recomendado.costeAnual : null,
        ahorro_anual: resultado.ahorroAnual,
        ahorro_porcentaje: resultado.ahorroPorcentaje,
        tarifa_actual_proveedor: cliente.operadorActual || null,
        tarifa_propuesta_id: resultado.recomendado ? resultado.recomendado.id : null,
        gestor_email: usuario.email,
      })

      setExito(true)
    } catch (err) {
      setError(err.message || 'No se ha podido generar el informe.')
    } finally {
      setGenerando(false)
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-brand-navy">Auditoría de Telecomunicaciones</h1>
            <p className="text-sm text-slate-500">Consultor/a: {usuario.nombre || usuario.email}</p>
          </div>
          <button
            onClick={async () => {
              await cerrarSesion()
              setUsuario(null)
            }}
            className="btn-ghost"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="mb-4 text-base font-semibold text-brand-navy">Datos del cliente</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Cliente" placeholder="Nombre y apellidos / Empresa" value={cliente.nombre} onChange={(e) => setCliente((c) => ({ ...c, nombre: e.target.value }))} />
              <TextField label="Ubicación" placeholder="Ciudad (Provincia)" value={cliente.ubicacion} onChange={(e) => setCliente((c) => ({ ...c, ubicacion: e.target.value }))} />
              <TextField label="Operador actual" placeholder="Movistar Fusión Total Plus" value={cliente.operadorActual} onChange={(e) => setCliente((c) => ({ ...c, operadorActual: e.target.value }))} />
              <TextField label="Factura analizada" placeholder="18 jul – 17 ago 2026" value={cliente.periodoFactura} onChange={(e) => setCliente((c) => ({ ...c, periodoFactura: e.target.value }))} />
            </div>
          </div>

          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-brand-navy">Diagnóstico: desglose de la factura actual</h3>
              <button onClick={anadirConcepto} className="btn-ghost !px-3 !py-1.5 text-xs">
                <Plus size={14} /> Añadir concepto
              </button>
            </div>
            <div className="space-y-2">
              {conceptos.map((c, idx) => (
                <div key={idx} className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[1fr_140px_200px_auto]">
                  <TextField label={idx === 0 ? 'Concepto' : undefined} placeholder="Cuota Fusión Total Plus" value={c.concepto} onChange={(e) => actualizarConcepto(idx, { concepto: e.target.value })} />
                  <TextField label={idx === 0 ? '€ / mes' : undefined} type="number" step="0.01" value={c.importeMes} onChange={(e) => actualizarConcepto(idx, { importeMes: e.target.value })} />
                  <SelectField label={idx === 0 ? 'Diagnóstico' : undefined} value={c.diagnostico} onChange={(e) => actualizarConcepto(idx, { diagnostico: e.target.value })}>
                    {DIAGNOSTICOS_FACTURA.map((d) => (
                      <option key={d.valor} value={d.valor}>
                        {d.valor}
                      </option>
                    ))}
                  </SelectField>
                  <button onClick={() => quitarConcepto(idx)} className="rounded bg-red-50 p-2 text-red-600" title="Quitar fila">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-3 text-right text-sm font-semibold text-brand-navy">Total factura actual: {formatEUR(costeActualMensual)} / mes</p>
          </div>

          <div className="card">
            <h3 className="mb-4 text-base font-semibold text-brand-navy">Hallazgos destacados (3 tarjetas del informe)</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {hallazgos.map((h, idx) => (
                <div key={idx} className="space-y-2">
                  <TextField label="Título" placeholder="Cuota 3 veces por encima del mercado" value={h.titulo} onChange={(e) => actualizarHallazgo(idx, { titulo: e.target.value })} />
                  <TextField label="Descripción" placeholder="Solo la cuota fija cuesta 238 €/mes..." value={h.descripcion} onChange={(e) => actualizarHallazgo(idx, { descripcion: e.target.value })} />
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="mb-4 text-base font-semibold text-brand-navy">Propuesta</h3>
            {cargandoMercado ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="animate-spin" size={16} /> Cargando catálogo de mercado…
              </div>
            ) : (
              <SelectField label="Operadora recomendada" value={operadorRecomendadoId} onChange={(e) => setOperadorRecomendadoId(e.target.value)}>
                <option value="">Usar la marcada como recomendada en el catálogo</option>
                {mercado.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.operador} — {formatEUR(op.cuota_mensual)}/mes
                  </option>
                ))}
              </SelectField>
            )}
            <p className="mt-2 text-xs text-slate-500">
              El catálogo de operadoras (precios, promociones y características) se gestiona en Panel de Configuración → Mercado.
            </p>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          {exito && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Informe generado y guardado correctamente.</p>}

          <button onClick={handleGenerar} disabled={generando || cargandoMercado} className="btn-primary w-full">
            {generando ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            Generar informe PDF
          </button>
        </div>
      </div>
    </Layout>
  )
}
