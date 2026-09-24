import { NavLink } from 'react-router'

// isOpen / onNavigate only matter on small screens, where the sidebar is a slide-in menu
function Sidebar({ isOpen, onNavigate }) {
  return (
    <nav
      id="main-navigation"
      className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}
      aria-label="Main navigation"
    >
      <p className="sidebar-section">Certificates</p>
      <NavLink to="/request-certificate" className="sidebar-link" onClick={onNavigate}>
        Request Certificate
      </NavLink>
      <NavLink to="/requests" className="sidebar-link" onClick={onNavigate}>
        Requests List
      </NavLink>
    </nav>
  )
}

export default Sidebar
