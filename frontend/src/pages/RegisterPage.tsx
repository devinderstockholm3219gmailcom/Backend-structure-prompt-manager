import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const { register, loading, error } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const ok = await register(username, email, password)
    if (ok) navigate('/')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">⚡ AI Prompts</div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Start building your prompt library</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {[
            { label: 'Username', value: username, setter: setUsername, type: 'text',     placeholder: 'johndoe' },
            { label: 'Email',    value: email,    setter: setEmail,    type: 'email',    placeholder: 'you@example.com' },
            { label: 'Password', value: password, setter: setPassword, type: 'password', placeholder: '••••••••' },
          ].map(({ label, value, setter, type, placeholder }) => (
            <div className="form-group" key={label}>
              <label className="form-label">{label}</label>
              <input
                className="form-input"
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={e => setter(e.target.value)}
                required
              />
            </div>
          ))}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}