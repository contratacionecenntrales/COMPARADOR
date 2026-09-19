import Header from './Header'
import Footer from './Footer'
import { isSupabaseConfigured } from '../../lib/supabaseClient'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      {!isSupabaseConfigured && (
        <div className="bg-amber-100 px-4 py-2 text-center text-xs font-medium text-amber-800">
          Modo demo: Supabase no está configurado. Se están usando datos de tarifas locales de ejemplo.
          Configura <code className="rounded bg-amber-200/70 px-1">VITE_SUPABASE_URL</code> y{' '}
          <code className="rounded bg-amber-200/70 px-1">VITE_SUPABASE_ANON_KEY</code> para conectar la base
          de datos real.
        </div>
      )}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
