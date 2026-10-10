import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Zap, Smartphone, ShieldCheck, History, Loader2, Users, CalendarDays, TrendingUp, FileBarChart } from 'lucide-react'
import Layout from '../components/layout/Layout'
import AdminLogin from '../components/admin/AdminLogin'
import TariffTable from '../components/admin/TariffTable'
import AuditsHistory from '../components/admin/AuditsHistory'
import AgentsPanel from '../components/admin/AgentsPanel'
import CalendarPanel from '../components/admin/CalendarPanel'
import {
  COLUMNAS_ENERGIA,
  FILA_VACIA_ENERGIA,
  COLUMNAS_TELEFONIA,
  FILA_VACIA_TELEFONIA,
  COLUMNAS_ALARMAS,
  FILA_VACIA_ALARMAS,
  COLUMNAS_MERCADO,
  FILA_VACIA_MERCADO,
} from '../components/admin/tariffColumns'
import { obtenerUsuarioActual, cerrarSesion } from '../lib/authService'

function tabsPara(rol) {
  const tabs = [
    { key: 'calendario', label: 'Calendario', icon: CalendarDays },
    { key: 'energia', label: 'Energía', icon: Zap },
    { key: 'telefonia', label: 'Telefonía', icon: Smartphone },
    { key: 'alarmas', label: 'Alarmas', icon: ShieldCheck },
    { key: 'mercado', label: 'Mercado', icon: TrendingUp },
    { key: 'historico', label: 'Histórico de auditorías', icon: History },
  ]
  if (rol === 'admin' || rol === 'jefe_equipo') {
    tabs.splice(1, 0, { key: 'agentes', label: 'Agentes', icon: Users })
  }
  return tabs
}

export default function AdminPage() {
  const [usuario, setUsuario] = useState(undefined) // undefined = comprobando
  const [tab, setTab] = useState('calendario')

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

  const tabs = tabsPara(usuario.rol)

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-brand-navy">Panel de Configuración</h1>
            <p className="text-sm text-slate-500">
              Sesión: {usuario.email} · {usuario.rol === 'admin' ? 'Administrador' : usuario.rol === 'jefe_equipo' ? 'Jefe de equipo' : 'Gestor comercial'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/auditoria-telecom" className="btn-primary">
              <FileBarChart size={16} /> Auditoría de Telecomunicaciones
            </Link>
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
        </div>

        <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          {tabs.map(({ key, label, icon: Icon }) => (
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

        {tab === 'calendario' && <CalendarPanel usuarioActual={usuario} />}
        {tab === 'agentes' && (usuario.rol === 'admin' || usuario.rol === 'jefe_equipo') && <AgentsPanel usuarioActual={usuario} />}
        {tab === 'energia' && (
          <TariffTable catalogo="energia" title="Tarifas de energía (luz y gas)" columns={COLUMNAS_ENERGIA} emptyRow={FILA_VACIA_ENERGIA} />
        )}
        {tab === 'telefonia' && (
          <TariffTable catalogo="telefonia" title="Tarifas de telefonía e internet" columns={COLUMNAS_TELEFONIA} emptyRow={FILA_VACIA_TELEFONIA} />
        )}
        {tab === 'alarmas' && (
          <TariffTable catalogo="alarmas" title="Kits de alarma" columns={COLUMNAS_ALARMAS} emptyRow={FILA_VACIA_ALARMAS} />
        )}
        {tab === 'mercado' && (
          <div>
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Catálogo de operadoras competidoras para el Informe de Auditoría y Optimización de Telecomunicaciones.
              Marca una sola fila como "Recomendada" (la que aparecerá destacada en dorado) y rellena sus
              características reales. Mantén los precios actualizados.
            </p>
            <TariffTable catalogo="mercado" title="Tarifas de mercado (competidoras)" columns={COLUMNAS_MERCADO} emptyRow={FILA_VACIA_MERCADO} />
          </div>
        )}
        {tab === 'historico' && <AuditsHistory />}
      </div>
    </Layout>
  )
}
