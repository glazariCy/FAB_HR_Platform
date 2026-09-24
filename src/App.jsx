import { createBrowserRouter, Navigate } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import CertificateRequestsList from './pages/CertificateRequestsListPage'
import RequestCertificate from './pages/RequestCertificatePage'
import AppLayout from './components/layout/AppLayout'

// A "data router" (instead of <BrowserRouter>) is needed for useBlocker,
// which lets the form ask before the user navigates away.
// It is created once, outside any component.
const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/request-certificate', element: <RequestCertificate /> },
      { path: '/requests', element: <CertificateRequestsList /> },
      { path: '*', element: <Navigate to="/request-certificate" replace /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
