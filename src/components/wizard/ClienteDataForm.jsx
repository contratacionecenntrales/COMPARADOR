import { TextField } from '../common/Field'

export default function ClienteDataForm({ cliente, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <TextField
        label="Nombre del cliente"
        placeholder="Nombre y apellidos / Empresa"
        value={cliente.nombre}
        onChange={(e) => onChange({ nombre: e.target.value })}
      />
      <TextField
        label="Teléfono de contacto"
        placeholder="600 000 000"
        value={cliente.telefono}
        onChange={(e) => onChange({ telefono: e.target.value })}
      />
      <TextField
        label="Email"
        type="email"
        placeholder="cliente@email.com"
        value={cliente.email}
        onChange={(e) => onChange({ email: e.target.value })}
      />
    </div>
  )
}
