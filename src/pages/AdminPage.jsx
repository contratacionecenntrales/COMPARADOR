import { useEffect, useState } from 'react'
import { LogOut, Zap, Smartphone, ShieldCheck, History, Loader2 } from 'lucide-react'
import Layout from '../components/layout/Layout'
import AdminLogin from '../components/admin/AdminLogin'
import TariffTable from '../components/admin/TariffTable'
import AuditsHistory from '../components/admin/AuditsHistory'
import {
  COLUMNAS_ENERGIA,
  FILA_VACIA_ENERGIA,
  COLUMNAS_TELEFONIA,
  FILA_VACIA_TELEFONIA,
  COLUMNAS_ALARMAS,
  FILA_VACIA_ALARMAS,
} from '../components/admin/tariffColumns'
import { obtenerUsuarioActual, cerrarSesion } from '../lib/authService'

const TABS = [
  { key: 'energia', label: 'Energía', icon: Zap },
  { key: 'telefonia', label: 'Telefonía', icon: Smartphone },
  { key: 'alarmas', label: 'Alarmas', icon: ShieldCheck },
  { key: 'historico', label: 'Histórico de auditorías', icon: History },
]

export default function AdminPage() {
  const [usuario, setUsuario] = useState(undefined) // undefined = comprobando
  const [tab, setTab] = useState('energia')

  useEffect(() => {
    obtenerUsuarioActual().then(setUsuario)
  }, [])

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

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-brand-navy">Panel de Configuración</h1>
            <p className="text-sm text-slate-500">
              Edita precios, peajes, términos y comisiones sin tocar código. Sesión: {usuario.email}
            </p>
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

        <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                tab === key ? 'bg-brand-navy text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {tab === 'energia' && (
          <TariffTable catalogo="energia" title="Tarifas de energía (luz y gas)" columns={COLUMNAS_ENERGIA} emptyRow={FILA_VACIA_ENERGIA} />
        )}
        {tab === 'telefonia' && (
          <TariffTable catalogo="telefonia" title="Tarifas de telefonía e internet" columns={COLUMNAS_TELEFONIA} emptyRow={FILA_VACIA_TELEFONIA} />
        )}
        {tab === 'alarmas' && (
          <TariffTable catalogo="alarmas" title="Kits de alarma" columns={COLUMNAS_ALARMAS} emptyRow={FILA_VACIA_ALARMAS} />
        )}
        {tab === 'historico' && <AuditsHistory />}
      </div>
    </Layout>
  )
}
