import { Routes, Route, Navigate, } from 'react-router-dom'
import { isLoggedIn } from '@lib/auth'
import Layout from '@components/Layout'
import LoginPage from '@pages/LoginPage'
import RegisterPage from '@pages/RegisterPage'
import DashboardPage from '@pages/DashboardPage'
import PromptsPage from '@pages/PromptsPage'
import CollectionsPage from '@pages/CollectionsPage'
import CollectionDetailPage from '@pages/CollectionDetailPage'
import AdminPage from '@pages/AdminPage'

export default function App() {

  return (
    <Routes>
      <Route path="/login"    element={isLoggedIn() ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={isLoggedIn() ? <Navigate to="/" replace /> : <RegisterPage />} />

      <Route element={<Layout />}>
        <Route path="/"                   element={<DashboardPage />} />
        <Route path="/prompts"            element={<PromptsPage />} />
        <Route path="/collections"        element={<CollectionsPage />} />
        <Route path="/collections/:id"    element={<CollectionDetailPage />} />
        <Route path="/admin"              element={<AdminPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}