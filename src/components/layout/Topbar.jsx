function Topbar({ isMenuOpen, onMenuToggle }) {
  return (
    <header className="topbar">
      {/* Only visible on small screens (see Layout.css) */}
      <button
        type="button"
        className="menu-button"
        onClick={onMenuToggle}
        aria-expanded={isMenuOpen}
        aria-controls="main-navigation"
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
          {isMenuOpen ? (
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      </button>

      <div className="topbar-brand">
        <span className="topbar-logo topbar-logo--full">FAB Human Resources Management</span>
        <span className="topbar-logo topbar-logo--short">FAB HR</span>
        <span className="topbar-company">Zalex Inc.</span>
      </div>
      <div className="topbar-user">Giorgos Lazari</div>
    </header>
  )
}

export default Topbar
