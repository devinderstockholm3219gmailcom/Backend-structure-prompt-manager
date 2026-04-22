import { NavLink} from 'react-router-dom'
import { getUser, logout } from '@lib/auth'

const navItems = [
  { to: '/',           icon: '▦',  label: 'Dashboard'   },
  { to: '/prompts',    icon: '✎',  label: 'Prompts'     },
  { to: '/collections',icon: '◫',  label: 'Collections' },
]

export default function Sidebar() {
  const user = getUser()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-text">⚡ AI Prompts</div>
        <div className="sidebar-logo-sub">Prompt Manager</div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Menu</div>
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }: { isActive: boolean }) =>
              `sidebar-nav-item${isActive ? ' active' : ''}`
            }
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="sidebar-section-label" style={{ marginTop: 16 }}>Admin</div>
            <NavLink
              to="/admin"
              className={({ isActive }: { isActive: boolean }) =>
                `sidebar-nav-item${isActive ? ' active' : ''}`
              }
            >
              <span className="nav-icon">⊞</span>
              Admin Panel
            </NavLink>
          </>
        )}
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-username">{user?.username}</div>
            <div className="sidebar-role">{user?.role}</div>
          </div>
        </div>
        <button
          className="sidebar-nav-item"
          style={{ color: '#ef4444', marginTop: 4 }}
          onClick={logout}
        >
          <span className="nav-icon">⇥</span>
          Logout
        </button>
      </div>
    </aside>
  )
}