
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useCollections, useCreateCollection, useDeleteCollection } from '@hooks/useCollections'

export default function CollectionsPage() {
  const [showModal, setShowModal] = useState(false)
  const [name, setName]           = useState('')
  const [desc, setDesc]           = useState('')

  const { data: collections, isLoading } = useCollections()
  const createCollection = useCreateCollection()
  const deleteCollection = useDeleteCollection()

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    await createCollection.mutateAsync({ name, description: desc || undefined })
    setName(''); setDesc(''); setShowModal(false)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Collections</h1>
          <p className="page-subtitle">{collections?.length ?? 0} collections</p>
        </div>
        <button
          className="btn btn-primary"
          style={{ width: 'auto' }}
          onClick={() => setShowModal(true)}
        >
          + New Collection
        </button>
      </div>

      {isLoading ? (
        <div className="loading-center"><span className="spinner" /></div>
      ) : !collections?.length ? (
        <div className="empty-state">
          <div className="empty-icon">◫</div>
          <div className="empty-title">No collections yet</div>
          <div className="empty-text">Group your prompts into collections for easy access</div>
        </div>
      ) : (
        <div className="item-grid">
          {collections.map(col => (
            <div key={col._id} className="item-card">
              <div className="item-card-title">{col.name}</div>

              {col.description && (
                <div className="item-card-desc">{col.description}</div>
              )}

              {/* No prompt count — collections list doesn't include prompts array */}
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Created {new Date(col.createdAt).toLocaleDateString()}
              </div>

              <div className="item-card-footer">
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {new Date(col.createdAt).toLocaleDateString()}
                </span>
                <div className="item-card-actions">
                  <Link
                    to={`/collections/${col._id}`}
                    className="btn btn-ghost btn-sm"
                  >
                    View →
                  </Link>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteCollection.mutate(col._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Collection Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={e => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">New Collection</span>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    className="form-input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="My collection"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    className="form-input"
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder="Optional description"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: 'auto' }}
                  disabled={createCollection.isPending}
                >
                  {createCollection.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}