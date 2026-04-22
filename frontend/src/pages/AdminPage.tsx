import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@lib/axios'
import { getUser } from '@lib/auth'
import { Navigate } from 'react-router-dom'

type Tab = 'overview' | 'users' | 'prompts' | 'collections'

// ── Types for API responses ───────────────────────────────────────────────
interface AdminUser {
  _id: string
  username: string
  email: string
  role: 'user' | 'admin'
  createdAt: string
}

interface AdminPrompt {
  _id: string
  title: string
  createdAt: string
  userId: { username: string } | null
}

interface AdminCollection {
  _id: string
  name: string
  createdAt: string
  userId: { username: string } | null
}

interface AdminStats {
  totalUsers: number
  totalPrompts: number
  totalCollections: number
}

interface PaginatedResponse<T> {
  prompts?: T[]
  collections?: T[]
  totalPages: number
}

export default function AdminPage() {
  // ── Hooks MUST come before any conditional return ─────────────────────
  const [tab, setTab] = useState<Tab>('overview')
  const user = getUser()

  // Early return AFTER all hooks
  if (user?.role !== 'admin') return <Navigate to="/" replace />

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview',    label: '📊 Overview'    },
    { key: 'users',       label: '👥 Users'        },
    { key: 'prompts',     label: '✎ Prompts'      },
    { key: 'collections', label: '◫ Collections'  },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">Manage all users and content across the platform</p>
        </div>
      </div>

      <div className="tab-bar">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            className={`tab-btn${tab === key ? ' active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview'    && <OverviewTab />}
      {tab === 'users'       && <UsersTab />}
      {tab === 'prompts'     && <AdminPromptsTab />}
      {tab === 'collections' && <AdminCollectionsTab />}
    </div>
  )
}

// ── Overview ───────────────────────────────────────────────────────────────
function OverviewTab() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get<AdminStats>('/admin/stats').then(r => r.data)
  })

  if (isLoading) return <div className="loading-center"><span className="spinner" /></div>

  const cards = [
    { icon: '👥', label: 'Total Users',       value: stats?.totalUsers,       bg: '#eef1fe', color: '#4f6ef7' },
    { icon: '✎',  label: 'Total Prompts',     value: stats?.totalPrompts,     bg: '#d1fae5', color: '#10b981' },
    { icon: '◫',  label: 'Total Collections', value: stats?.totalCollections, bg: '#ede9fe', color: '#8b5cf6' },
  ]

  return (
    <div className="stats-grid">
      {cards.map(({ icon, label, value, bg, color }) => (
        <div className="stat-card" key={label}>
          <div className="stat-icon" style={{ background: bg }}>
            <span style={{ color }}>{icon}</span>
          </div>
          <div className="stat-value">{value ?? 0}</div>
          <div className="stat-label">{label}</div>
        </div>
      ))}
    </div>
  )
}

// ── Users ──────────────────────────────────────────────────────────────────
function UsersTab() {
  const { data: users, isLoading } = useQuery<AdminUser[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => api.get<AdminUser[]>('/admin/users').then(r => r.data)
  })

  if (isLoading) return <div className="loading-center"><span className="spinner" /></div>

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((u) => (
            <tr key={u._id}>
              <td style={{ fontWeight: 500 }}>{u.username}</td>
              <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
              <td>
                <span className={`badge ${u.role === 'admin' ? 'badge-yellow' : 'badge-blue'}`}>
                  {u.role === 'admin' ? '👑 admin' : 'user'}
                </span>
              </td>
              <td style={{ color: 'var(--text-muted)' }}>
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Admin Prompts ──────────────────────────────────────────────────────────
function AdminPromptsTab() {
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery<PaginatedResponse<AdminPrompt>>({
    queryKey: ['admin', 'prompts', page],
    queryFn: () =>
      api.get<PaginatedResponse<AdminPrompt>>('/admin/prompts', { params: { page, limit: 10 } })
        .then(r => r.data)
  })

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/prompts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'prompts'] })
  })

  if (isLoading) return <div className="loading-center"><span className="spinner" /></div>

  return (
    <>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Title</th><th>Owner</th><th>Created</th><th>Action</th></tr>
          </thead>
          <tbody>
            {data?.prompts?.map((p) => (
              <tr key={p._id}>
                <td style={{ fontWeight: 500 }}>{p.title}</td>
                <td><span className="badge badge-blue">{p.userId?.username ?? '—'}</span></td>
                <td style={{ color: 'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => del.mutate(p._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(data?.totalPages ?? 0) > 1 && (
        <div className="pagination">
          {Array.from({ length: data?.totalPages ?? 0 }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`page-btn${p === page ? ' active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </>
  )
}

// ── Admin Collections ──────────────────────────────────────────────────────
function AdminCollectionsTab() {
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery<PaginatedResponse<AdminCollection>>({
    queryKey: ['admin', 'collections', page],
    queryFn: () =>
      api.get<PaginatedResponse<AdminCollection>>('/admin/collections', { params: { page, limit: 10 } })
        .then(r => r.data)
  })

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/collections/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'collections'] })
  })

  if (isLoading) return <div className="loading-center"><span className="spinner" /></div>

  return (
    <>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Owner</th><th>Created</th><th>Action</th></tr>
          </thead>
          <tbody>
            {data?.collections?.map((c) => (
              <tr key={c._id}>
                <td style={{ fontWeight: 500 }}>{c.name}</td>
                <td><span className="badge badge-purple">{c.userId?.username ?? '—'}</span></td>
                <td style={{ color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => del.mutate(c._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(data?.totalPages ?? 0) > 1 && (
        <div className="pagination">
          {Array.from({ length: data?.totalPages ?? 0 }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`page-btn${p === page ? ' active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </>
  )
}