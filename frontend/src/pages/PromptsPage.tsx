import { useState, useRef, useEffect, type FormEvent } from 'react'
import { usePrompts, useCreatePrompt, useDeletePrompt, useUpdatePrompt } from '@hooks/usePrompts'
import { useCollections } from '@hooks/useCollections'
import type { Prompt } from '../types'

export default function PromptsPage() {
  const [page, setPage]           = useState(1)
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)

  const { data, isLoading } = usePrompts(page, search)
  const createPrompt        = useCreatePrompt()
  const deletePrompt        = useDeletePrompt()
  const updatePrompt        = useUpdatePrompt()
  const { data: collections } = useCollections()

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value)
    setPage(1)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Prompts</h1>
          <p className="page-subtitle">{data?.pagination.total ?? 0} prompts in your library</p>
        </div>
        <button
          className="btn btn-primary"
          style={{ width: 'auto' }}
          onClick={() => setShowModal(true)}
        >
          + New Prompt
        </button>
      </div>

      <div className="search-bar">
        <input
          className="search-input"
          placeholder="Search prompts..."
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {isLoading ? (
        <div className="loading-center"><span className="spinner" /></div>
      ) : !data?.prompts.length ? (
        <div className="empty-state">
          <div className="empty-icon">✎</div>
          <div className="empty-title">{search ? 'No results found' : 'No prompts yet'}</div>
          <div className="empty-text">
            {search ? 'Try a different search term' : 'Click "+ New Prompt" to get started'}
          </div>
        </div>
      ) : (
        <>
          <div className="item-grid">
            {data.prompts.map(prompt => (
              <PromptCard
                key={prompt._id}
                prompt={prompt}
                collections={collections ?? []}
                onDelete={() => deletePrompt.mutate(prompt._id)}
                onMoveToCollection={(collectionId) =>
                  updatePrompt.mutate({ id: prompt._id, collectionId })
                }
              />
            ))}
          </div>

          {data?.pagination.totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map(p => (
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
      )}

      {showModal && (
        <CreatePromptModal
          onClose={() => setShowModal(false)}
          onCreate={async (body) => {
            await createPrompt.mutateAsync(body)
            setShowModal(false)
          }}
          loading={createPrompt.isPending}
        />
      )}
    </div>
  )
}

// ── Prompt Card ────────────────────────────────────────────────────────────
interface Collection {
  _id: string
  name: string
}

function PromptCard({
  prompt,
  collections,
  onDelete,
  onMoveToCollection,
}: {
  prompt: Prompt
  collections: Collection[]
  onDelete: () => void
  onMoveToCollection: (collectionId: string | null) => void
}) {
  const [expanded, setExpanded]       = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef                   = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown])

  // Find current collection name if prompt is linked
  const currentCollection = collections.find(c => c._id === prompt.collectionId)

  return (
    <div className="item-card">
      <div className="item-card-title">{prompt.title}</div>

      {prompt.description && (
        <div className="item-card-desc">{prompt.description}</div>
      )}

      {expanded && (
        <div className="item-card-content">{prompt.content}</div>
      )}

      {/* Show which collection this prompt belongs to */}
      {currentCollection && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>In collection:</span>
          <span className="badge badge-blue">{currentCollection.name}</span>
        </div>
      )}

      {prompt.tags.length > 0 && (
        <div className="tags">
          {prompt.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      )}

      <div className="item-card-footer">
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {new Date(prompt.createdAt).toLocaleDateString()}
        </span>

        <div className="item-card-actions">
          {/* View / Hide */}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? 'Hide' : 'View'}
          </button>

          {/* Move to collection dropdown */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowDropdown(d => !d)}
              title="Move to collection"
            >
              📁 {showDropdown ? '▲' : '▼'}
            </button>

            {showDropdown && (
              <div style={{
                position: 'absolute',
                bottom: '110%',
                right: 0,
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                minWidth: 180,
                zIndex: 50,
                overflow: 'hidden',
              }}>
                {/* Dropdown header */}
                <div style={{
                  padding: '8px 12px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid var(--card-border)',
                }}>
                  Move to collection
                </div>

                {/* Remove from collection option */}
                {prompt.collectionId && (
                  <button
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '9px 12px',
                      textAlign: 'left',
                      fontSize: 13,
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: 'var(--red)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--red-light)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    onClick={() => {
                      onMoveToCollection(null)
                      setShowDropdown(false)
                    }}
                  >
                    ✕ Remove from collection
                  </button>
                )}

                {/* Collection list */}
                {collections.length === 0 ? (
                  <div style={{ padding: '9px 12px', fontSize: 13, color: 'var(--text-muted)' }}>
                    No collections yet
                  </div>
                ) : (
                  collections.map(col => (
                    <button
                      key={col._id}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '9px 12px',
                        textAlign: 'left',
                        fontSize: 13,
                        border: 'none',
                        background: col._id === prompt.collectionId ? 'var(--accent-light)' : 'none',
                        cursor: 'pointer',
                        color: col._id === prompt.collectionId ? 'var(--accent)' : 'var(--text-primary)',
                        fontWeight: col._id === prompt.collectionId ? 600 : 400,
                      }}
                      onMouseEnter={e => {
                        if (col._id !== prompt.collectionId)
                          e.currentTarget.style.background = '#f9fafb'
                      }}
                      onMouseLeave={e => {
                        if (col._id !== prompt.collectionId)
                          e.currentTarget.style.background = 'none'
                      }}
                      onClick={() => {
                        onMoveToCollection(col._id)
                        setShowDropdown(false)
                      }}
                    >
                      {col._id === prompt.collectionId ? '✓ ' : ''}{col.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Delete */}
          <button className="btn btn-danger btn-sm" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Create Modal ───────────────────────────────────────────────────────────
function CreatePromptModal({
  onClose,
  onCreate,
  loading,
}: {
  onClose: () => void
  onCreate: (body: Partial<Prompt>) => Promise<void>
  loading: boolean
}) {
  const [title, setTitle]     = useState('')
  const [content, setContent] = useState('')
  const [desc, setDesc]       = useState('')
  const [tags, setTags]       = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await onCreate({
      title,
      content,
      description: desc || undefined,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    })
  }

  return (
    <div
      className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">New Prompt</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                className="form-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="My prompt title"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Content *</label>
              <textarea
                className="form-input"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Your prompt content..."
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
            <div className="form-group">
              <label className="form-label">
                Tags{' '}
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                  (comma separated)
                </span>
              </label>
              <input
                className="form-input"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="gpt4, writing, creative"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: 'auto' }}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Prompt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}