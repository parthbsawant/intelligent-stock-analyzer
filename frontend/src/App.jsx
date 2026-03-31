import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import BacktestingPage from './pages/BacktestingPage'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import PortfolioPage from './pages/PortfolioPage'
import SignupPage from './pages/SignupPage'
import StockAnalysisPage from './pages/StockAnalysisPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/stock-analysis" element={<StockAnalysisPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/backtesting" element={<BacktestingPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
