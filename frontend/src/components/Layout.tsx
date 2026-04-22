import { Outlet, Navigate } from 'react-router-dom'
import { isLoggedIn } from '@lib/auth'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout() {
  if (!isLoggedIn()) return <Navigate to="/login" replace />

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <Navbar />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}