import { useEffect, useState } from 'react'
import Header from './Header'
import Footer from './Footer'
import { comprobarConexionAPI } from '../../lib/dataService'

export default function Layout({ children }) {
  const [modoDemo, setModoDemo] = useState(false)

  useEffect(() => {
    let activo = true
    comprobarConexionAPI().then((ok) => {
      if (activo) setModoDemo(!ok)
    })
    return () => {
      activo = false
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      {modoDemo && (
        <div className="bg-amber-100 px-4 py-2 text-center text-xs font-medium text-amber-800">
          Modo demo: no se ha podido conectar con la API (api/config.php). Se están usando datos de
          tarifas locales de ejemplo. Revisa el despliegue en Hostalia (ver README).
        </div>
      )}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
