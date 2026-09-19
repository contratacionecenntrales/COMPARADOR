import { createContext, useContext, useMemo, useState } from 'react'

const AuditContext = createContext(null)

const ESTADO_INICIAL = {
  sector: null,
  cliente: { nombre: '', email: '', telefono: '' },
  energia: { incluyeLuz: true, incluyeGas: false, luz: null, gas: null },
  telefonia: null,
  alarmas: null,
  resultado: null,
}

export function AuditProvider({ children }) {
  const [state, setState] = useState(ESTADO_INICIAL)

  const value = useMemo(
    () => ({
      state,
      setSector: (sector) => setState((s) => ({ ...s, sector })),
      setCliente: (cliente) => setState((s) => ({ ...s, cliente: { ...s.cliente, ...cliente } })),
      setEnergia: (energia) => setState((s) => ({ ...s, energia: { ...s.energia, ...energia } })),
      setTelefonia: (telefonia) => setState((s) => ({ ...s, telefonia })),
      setAlarmas: (alarmas) => setState((s) => ({ ...s, alarmas })),
      setResultado: (resultado) => setState((s) => ({ ...s, resultado })),
      reset: () => setState(ESTADO_INICIAL),
    }),
    [state]
  )

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>
}

export function useAudit() {
  const ctx = useContext(AuditContext)
  if (!ctx) throw new Error('useAudit debe usarse dentro de <AuditProvider>')
  return ctx
}
