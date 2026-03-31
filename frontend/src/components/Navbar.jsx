import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import Button from './Button'
import { isAuthenticated, logoutUser } from '../utils/auth'

const navLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
    isActive
      ? 'bg-blue-50 text-[var(--color-secondary)] shadow-sm'
      : 'text-[var(--color-primary)] hover:bg-slate-100 hover:text-[var(--color-secondary)]'
  }`

function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isLanding = pathname === '/'
  const authed = isAuthenticated()

  const handleLogout = () => {
    logoutUser()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <NavLink to="/" className="text-xl font-bold text-[var(--color-primary)]">
          FinTech Pro
        </NavLink>

        {!isLanding && (
          <div className="hidden items-center gap-6 md:flex">
            <NavLink to="/" className={navLinkClass}>
              Landing
            </NavLink>
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/stock-analysis" className={navLinkClass}>
              Stock Analysis
            </NavLink>
            <NavLink to="/portfolio" className={navLinkClass}>
              Portfolio
            </NavLink>
            <NavLink to="/backtesting" className={navLinkClass}>
              Backtesting
            </NavLink>
          </div>
        )}

        <div className="flex items-center gap-3">
          {authed ? (
            <Button type="button" variant="outline" size="md" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <>
              <Button as={NavLink} to="/login" variant="outline" size="md">
                Login
              </Button>
              <Button as={NavLink} to="/signup" variant="primary" size="md">
                Signup
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
