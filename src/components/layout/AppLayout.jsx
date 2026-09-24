import { useEffect, useState } from 'react'
import { Outlet } from 'react-router'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import './Layout.css'

function AppLayout() {
  // Small screens only: whether the slide-in navigation menu is open.
  // The state lives here because both the Topbar (button) and the Sidebar (menu) need it.
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  function closeMenu() {
    setIsMenuOpen(false)
  }

  // While the menu is open, the Escape key closes it
  useEffect(() => {
    if (!isMenuOpen) return

    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  return (
    <div className="app">
      <Topbar isMenuOpen={isMenuOpen} onMenuToggle={() => setIsMenuOpen((open) => !open)} />
      <div className="app-body">
        <Sidebar isOpen={isMenuOpen} onNavigate={closeMenu} />
        {/* Dimmed background behind the open menu; clicking it closes the menu */}
        {isMenuOpen && <div className="sidebar-backdrop" onClick={closeMenu} aria-hidden="true" />}
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
