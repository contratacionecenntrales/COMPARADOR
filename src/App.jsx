import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import WizardPage from './pages/WizardPage'
import ResultsPage from './pages/ResultsPage'
import AdminPage from './pages/AdminPage'
import TelecomAuditPage from './pages/TelecomAuditPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/comparador" element={<WizardPage />} />
      <Route path="/resultados" element={<ResultsPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/auditoria-telecom" element={<TelecomAuditPage />} />
    </Routes>
  )
}
