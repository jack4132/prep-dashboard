import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const items = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tests/new', label: 'Create Test' },
]

export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-dot" />
          <div>
            <p className="brand-eyebrow">Preproute</p>
            <h1 className="brand-title">Test Manager</h1>
          </div>
        </div>

        <nav className="topnav">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={location.pathname.startsWith(item.to) ? 'active-link' : ''}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button type="button" className="ghost-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>
      <main className="page-wrap">
        <Outlet />
      </main>
    </div>
  )
}
