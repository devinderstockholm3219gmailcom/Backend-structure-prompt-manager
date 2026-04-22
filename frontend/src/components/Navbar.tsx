import { useLocation } from 'react-router-dom'
import { getUser } from '@lib/auth'

const titles: Record<string, string> = {
  '/':            'Dashboard',
  '/prompts':     'Prompts',
  '/collections': 'Collections',
  '/admin':       'Admin Panel',
}

export default function Navbar() {
  const { pathname } = useLocation()
  const user  = getUser()
  const title = titles[pathname] ?? 'AI Prompt Manager'

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-page-title">{title}</span>
      </div>
      <div className="navbar-right">
        {user?.role === 'admin' && (
          <span className="navbar-badge admin">👑 Admin</span>
        )}
        <span className="navbar-badge">{user?.username}</span>
      </div>
    </nav>
  )
}