import { Routes, Route, Navigate } from 'react-router'
import CertificateRequestsList from './pages/CertificateRequestsListPage'
import RequestCertificate  from './pages/RequestCertificatePage'
import AppLayout from './components/layout/AppLayout'
function App() {
  
  return(
     <Routes>
      <Route element={<AppLayout />}>
        <Route path="/request-certificate" element={<RequestCertificate />} />
        <Route path="/requests" element={<CertificateRequestsList />} />
        <Route path="*" element={<Navigate to="/request-certificate" replace />} />
      </Route>
    </Routes>
  )
}

export default App
