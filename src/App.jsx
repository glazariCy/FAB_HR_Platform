import { Routes, Route, Navigate } from 'react-router'
import CertificateRequestsList from './pages/CertificateRequestsListPage'
import RequestCertificate  from './pages/RequestCertificatePage'

function App() {
  const [count, setCount] = useState(0)

  return(
     <Routes>
      <Route path="/request-certificate" element={<RequestCertificate />} />
      <Route path="/requests" element={<CertificateRequestsList />} />
      <Route path="*" element={<Navigate to="/request-certificate" replace />} />
    </Routes>
  )
}

export default App
