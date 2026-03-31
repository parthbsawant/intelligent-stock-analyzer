import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { isAuthenticated, loginUser } from '../utils/auth'

function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (isAuthenticated()) navigate('/dashboard', { replace: true })
  }, [navigate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(false)

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.')
      return
    }

    const isValidEmail = /\S+@\S+\.\S+/.test(formData.email)
    if (!isValidEmail) {
      setError('Please enter a valid email address.')
      return
    }

    setError('')
    setSubmitted(true)
    loginUser('dummy-token')
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-[var(--color-primary)]">Login</h1>
      <p className="mt-2 text-sm text-slate-600">Access your fintech workspace.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-blue-100"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-blue-100"
            placeholder="Enter password"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {submitted && !error && <p className="text-sm text-emerald-600">Validation passed. Backend integration pending.</p>}

        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        Don&apos;t have an account?{' '}
        <NavLink to="/signup" className="font-medium text-[var(--color-secondary)]">
          Sign up
        </NavLink>
      </p>
    </div>
  )
}

export default LoginPage
