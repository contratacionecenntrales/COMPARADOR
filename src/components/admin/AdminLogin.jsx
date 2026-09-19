import { useState } from 'react'
import { Lock, Loader2 } from 'lucide-react'
import logoIcon from '../../assets/brand/icc-icon.png'
import { TextField } from '../common/Field'
import { iniciarSesion } from '../../lib/authService'

export default function AdminLogin({ onLoggedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const usuario = await iniciarSesion(email, password)
      onLoggedIn(usuario)
    } catch (err) {
      setError(err.message || 'No se ha podido iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4">
      <img src={logoIcon} alt="" className="mb-4 h-14 w-14" />
      <div className="card w-full">
        <div className="mb-5 flex items-center gap-2">
          <Lock size={18} className="text-brand-gold" />
          <h1 className="text-lg font-bold text-brand-navy">Panel interno</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Contraseña" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Lock size={16} />}
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
