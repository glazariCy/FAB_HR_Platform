import { NavLink } from 'react-router'

function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Main navigation">
      <p className="sidebar-section">Certificates</p>
      <NavLink to="/request-certificate" className="sidebar-link">
        Request Certificate
      </NavLink>
      <NavLink to="/requests" className="sidebar-link">
        Requests List
      </NavLink>
    </nav>
  )
}

export default Sidebar