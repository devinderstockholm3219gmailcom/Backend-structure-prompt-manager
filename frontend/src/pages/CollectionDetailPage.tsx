import { useParams, Link } from 'react-router-dom'
import { useCollection } from '@hooks/useCollections'

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>()

  // useCollection now returns { collection, prompts } — not a Collection directly
  const { data, isLoading } = useCollection(id ?? '')

  const collection = data?.collection
  const prompts    = data?.prompts ?? []

  if (isLoading) return (
    <div className="loading-center"><span className="spinner" /></div>
  )

  if (!collection) return (
    <div className="empty-state">
      <div className="empty-icon">◫</div>
      <div className="empty-title">Collection not found</div>
      <Link
        to="/collections"
        className="btn btn-secondary"
        style={{ marginTop: 12 }}
      >
        ← Back
      </Link>
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{collection.name}</h1>
          {collection.description && (
            <p className="page-subtitle">{collection.description}</p>
          )}
        </div>
        <Link
          to="/collections"
          className="btn btn-secondary"
          style={{ width: 'auto' }}
        >
          ← Back
        </Link>
      </div>

      {/* Prompt count badge */}
      <div style={{ marginBottom: 20 }}>
        <span className="badge badge-blue">
          {prompts.length} prompt{prompts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {!prompts.length ? (
        <div className="empty-state">
          <div className="empty-icon">✎</div>
          <div className="empty-title">No prompts in this collection</div>
          <div className="empty-text">
            Move prompts here using the 📁 button on the Prompts page
          </div>
        </div>
      ) : (
        <div className="item-grid">
          {prompts.map(prompt => (
            <div key={prompt._id} className="item-card">
              <div className="item-card-title">{prompt.title}</div>

              {prompt.description && (
                <div className="item-card-desc">{prompt.description}</div>
              )}

              <div className="item-card-content">{prompt.content}</div>

              {prompt.tags.length > 0 && (
                <div className="tags">
                  {prompt.tags.map(t => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              )}

              <div className="item-card-footer">
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {new Date(prompt.createdAt).toLocaleDateString()}
                </span>
                {prompt.isFavorite && (
                  <span className="badge badge-yellow">★ Favorite</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}