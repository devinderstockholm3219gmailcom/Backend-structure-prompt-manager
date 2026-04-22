import { usePrompts } from '@hooks/usePrompts'
import { useCollections } from '@hooks/useCollections'
import { getUser } from '@lib/auth'

export default function DashboardPage() {
  const { data: promptData }  = usePrompts(1, '')
  const { data: collections } = useCollections()
  const user = getUser()

  // ← pagination object from backend { prompts, pagination: { total, totalPages, ... } }
  const totalPrompts  = promptData?.pagination.total      ?? 0
  const totalPages    = promptData?.pagination.totalPages ?? 0

  const stats = [
    { icon: '✎', label: 'Total Prompts',   value: totalPrompts,        color: '#eef1fe', iconColor: '#4f6ef7' },
    { icon: '◫', label: 'Collections',     value: collections?.length ?? 0, color: '#d1fae5', iconColor: '#10b981' },
    { icon: '⊞', label: 'Pages of Prompts', value: totalPages,         color: '#ede9fe', iconColor: '#8b5cf6' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Good to see you, {user?.username} 👋</h1>
          <p className="page-subtitle">Here's an overview of your prompt library</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        {stats.map(({ icon, label, value, color, iconColor }) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon" style={{ background: color }}>
              <span style={{ color: iconColor }}>{icon}</span>
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent prompts */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">Recent Prompts</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {!promptData?.prompts.length ? (
            <div className="empty-state">
              <div className="empty-icon">✎</div>
              <div className="empty-title">No prompts yet</div>
              <div className="empty-text">Go to Prompts and create your first one</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Tags</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {promptData.prompts.slice(0, 6).map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 500 }}>{p.title}</td>
                    <td>
                      <div className="tags">
                        {p.tags.slice(0, 3).map(t => (
                          <span key={t} className="tag">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Recent collections */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Collections</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {!collections?.length ? (
            <div className="empty-state">
              <div className="empty-icon">◫</div>
              <div className="empty-title">No collections yet</div>
              <div className="empty-text">Organise your prompts into collections</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {collections.slice(0, 5).map(c => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {c.description ?? '—'}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}