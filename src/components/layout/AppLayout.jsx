import { Outlet } from 'react-router'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import './Layout.css'

function AppLayout() {
  return (
    <div className="app">
      <Topbar />
      <div className="app-body">
        <Sidebar />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout