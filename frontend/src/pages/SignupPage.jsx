import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { isAuthenticated, loginUser } from '../utils/auth'

function SignupPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (isAuthenticated()) navigate('/dashboard', { replace: true })
  }, [navigate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    const nextErrors = {}

    if (!formData.name.trim()) {
      nextErrors.name = 'Name is required.'
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = 'Please enter a valid email address.'
    }

    if (formData.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
    }

    if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    return nextErrors
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    const ok = Object.keys(nextErrors).length === 0
    setSubmitted(ok)
    if (ok) {
      loginUser('dummy-token')
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-[var(--color-primary)]">Create Account</h1>
      <p className="mt-2 text-sm text-slate-600">Get started with AI-powered market insights.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-blue-100"
            placeholder="Your name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

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
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
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
            placeholder="Minimum 8 characters"
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-slate-700">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-blue-100"
            placeholder="Re-enter password"
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
        </div>

        {submitted && Object.keys(errors).length === 0 && (
          <p className="text-sm text-emerald-600">Validation passed. Backend integration pending.</p>
        )}

        <Button type="submit" className="w-full">
          Sign Up
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <NavLink to="/login" className="font-medium text-[var(--color-secondary)]">
          Login
        </NavLink>
      </p>
    </div>
  )
}

export default SignupPage
