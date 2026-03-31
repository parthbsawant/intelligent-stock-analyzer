import { useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import Loader from '../components/Loader'
import SectionContainer from '../components/SectionContainer'
import { Skeleton } from '../components/Skeleton'

const summaryCards = [
  { title: 'Sentiment', value: '+0.62', tone: 'BUY', helper: 'Strong positive sentiment' },
  { title: 'Prediction', value: 'Bullish', tone: 'BUY', helper: '7-day projection uptrend' },
  { title: 'Risk', value: 'Medium', tone: 'HOLD', helper: 'Volatility in normal range' },
  { title: 'Signal', value: 'SELL', tone: 'SELL', helper: 'Short-term reversal detected' },
]

const topSectors = [
  { name: 'Technology', sentiment: 'Positive', trend: 'up' },
  { name: 'Healthcare', sentiment: 'Neutral', trend: 'up' },
  { name: 'Energy', sentiment: 'Negative', trend: 'down' },
  { name: 'Financials', sentiment: 'Positive', trend: 'up' },
  { name: 'Consumer', sentiment: 'Neutral', trend: 'down' },
]

const trendingStocks = [
  { name: 'AAPL', signal: 'BUY', confidence: 84 },
  { name: 'NVDA', signal: 'BUY', confidence: 88 },
  { name: 'TSLA', signal: 'HOLD', confidence: 71 },
  { name: 'MSFT', signal: 'BUY', confidence: 82 },
  { name: 'NFLX', signal: 'SELL', confidence: 77 },
]

const priceData = [
  { day: 'Mon', price: 182 },
  { day: 'Tue', price: 185 },
  { day: 'Wed', price: 183 },
  { day: 'Thu', price: 188 },
  { day: 'Fri', price: 191 },
  { day: 'Sat', price: 190 },
  { day: 'Sun', price: 193 },
]

const newsFeed = [
  { title: 'Fed commentary supports risk-on sentiment in equities', sentiment: 'BUY' },
  { title: 'Energy sector weakens after crude inventory surprise', sentiment: 'SELL' },
  { title: 'Mega-cap tech earnings outlook remains balanced', sentiment: 'HOLD' },
  { title: 'Financials rise as bond yields stabilize', sentiment: 'BUY' },
]

const toneClass = {
  BUY: 'text-emerald-600',
  SELL: 'text-rose-600',
  HOLD: 'text-amber-600',
}

function SummaryIcon({ type }) {
  const common = 'h-5 w-5'
  if (type === 'Sentiment') {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M4 12a8 8 0 1 0 16 0A8 8 0 0 0 4 12Z" />
        <path d="M8.5 10.5h.01M15.5 10.5h.01" />
        <path d="M8.5 15.5c1.2 1 2.6 1.5 3.5 1.5s2.3-.5 3.5-1.5" />
      </svg>
    )
  }
  if (type === 'Prediction') {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M4 19V5" />
        <path d="M4 15c3-1 5-6 8-6s5 4 8 3" />
        <path d="M20 12v7" />
      </svg>
    )
  }
  if (type === 'Risk') {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 3 2 9l10 6 10-6-10-6Z" />
        <path d="M2 9v6l10 6 10-6V9" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 2v20" />
      <path d="M7 7h10" />
      <path d="M7 17h10" />
      <path d="m9 9 3 3 3-3" />
      <path d="m9 15 3-3 3 3" />
    </svg>
  )
}

function TrendPill({ direction }) {
  const isUp = direction === 'up'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        isUp
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-rose-200 bg-rose-50 text-rose-700'
      }`}
    >
      <span aria-hidden="true">{isUp ? '▲' : '▼'}</span>
      <span>{isUp ? 'Up' : 'Down'}</span>
    </span>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 xl:col-span-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-2 h-4 w-56" />
            </div>
            <Skeleton className="h-9 w-44 rounded-md" />
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-28 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-8 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-8 w-28" />
              <Skeleton className="mt-2 h-3 w-40" />
              <Skeleton className="mt-4 h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-2 h-4 w-56" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="rounded-md bg-slate-50 px-3 py-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="w-full">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="mt-2 h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-4 w-64" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="rounded-md bg-slate-50 px-3 py-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="w-full">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="mt-2 h-3 w-36" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-8">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="mt-2 h-4 w-32" />
          <Skeleton className="mt-4 h-72 w-full rounded-xl" />
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-2 h-4 w-44" />
          <div className="mt-4 rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-5/6" />
            <Skeleton className="mt-2 h-3 w-4/6" />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-2 h-4 w-60" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="rounded-md bg-slate-50 px-3 py-2">
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DashboardPage() {
  const [query, setQuery] = useState('')
  const [isLoading] = useState(false)

  const handleSearch = (event) => {
    event.preventDefault()
  }

  return (
    <div className="space-y-6">
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Market Overview</h2>
              <p className="text-sm text-slate-500">Real-time sentiment and quick signal scan.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <SectionContainer
              title="Search Symbol"
              subtitle="Quickly analyze any stock ticker."
              rightContent={isLoading ? <Loader text="Fetching market snapshot..." /> : null}
              className="xl:col-span-4"
            >
              <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value.toUpperCase())}
                  placeholder="Enter stock symbol"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-blue-100"
                />
                <Button type="submit">Search</Button>
              </form>
            </SectionContainer>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-8 xl:grid-cols-4">
              {summaryCards.map((item) => (
                <Card key={item.title} title="">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`grid h-10 w-10 place-items-center rounded-xl border ${
                          item.tone === 'BUY'
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : item.tone === 'SELL'
                              ? 'border-red-200 bg-red-50 text-red-700'
                              : 'border-orange-200 bg-orange-50 text-orange-700'
                        }`}
                      >
                        <SummaryIcon type={item.title} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-500">{item.title}</p>
                        <p className={`mt-1 text-2xl font-bold tracking-tight ${toneClass[item.tone]}`}>{item.value}</p>
                        <p className="mt-1 text-sm leading-5 text-slate-500">{item.helper}</p>
                      </div>
                    </div>
                    <div className="pt-1">
                      <Badge label={item.tone} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Insights</h2>
              <p className="text-sm text-slate-500">Sector trends and market movers in one glance.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
            <SectionContainer title="Top Sectors" subtitle="Sector-level sentiment and trend tracking.">
              <ul className="space-y-3">
                {topSectors.map((sector) => (
                  <li
                    key={sector.name}
                    className="flex items-center justify-between rounded-xl border border-transparent bg-slate-50 px-3 py-2 transition-all duration-200 hover:border-slate-200 hover:bg-slate-100"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-primary)]">{sector.name}</p>
                      <p className="text-xs text-slate-500">{sector.sentiment}</p>
                    </div>
                    <TrendPill direction={sector.trend} />
                  </li>
                ))}
              </ul>
            </SectionContainer>

            <SectionContainer title="Trending Stocks" subtitle="High attention names with model confidence.">
              <ul className="space-y-3">
                {trendingStocks.map((stock) => (
                  <li
                    key={stock.name}
                    className="flex items-center justify-between rounded-xl border border-transparent bg-slate-50 px-3 py-2 transition-all duration-200 hover:border-slate-200 hover:bg-slate-100"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-primary)]">{stock.name}</p>
                      <p className="text-xs text-slate-500">Confidence: {stock.confidence}%</p>
                    </div>
                    <Badge label={stock.signal} />
                  </li>
                ))}
              </ul>
            </SectionContainer>
          </div>
          </section>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12 lg:grid-cols-12">
            <SectionContainer
              title="Stock Performance"
              subtitle="Last 7 sessions"
              rightContent={<Badge label="BUY" />}
              className="md:col-span-8 lg:col-span-8"
            >
              <div className="h-72 w-full min-w-0 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 via-white to-slate-50 p-3">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <LineChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="price" stroke="#1E88E5" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SectionContainer>

            <SectionContainer
              title="AI Insights"
              subtitle="Model-generated market context"
              className="md:col-span-4 lg:col-span-4"
            >
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-sm leading-6 text-slate-700">
                  Momentum remains constructive in large-cap technology while cyclicals show mixed conviction. A defensive
                  allocation tilt is recommended if volatility index rises above recent range.
                </p>
                <div className="mt-5 rounded-xl border-l-4 border-blue-500 bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-[var(--color-primary)]">Technical Snapshot</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-slate-600">RSI</span>
                    <span className="text-sm font-semibold text-[var(--color-primary)]">64.2</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-slate-600">Trend</span>
                    <span className="text-sm font-semibold text-emerald-600">Bullish</span>
                  </div>
                </div>
              </div>
            </SectionContainer>
          </div>

          <section className="space-y-4 rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">News Analysis</h2>
              <p className="text-sm text-slate-500">Headline-level sentiment and trade bias.</p>
            </div>
            <SectionContainer title="News Feed" subtitle="Recent headlines with sentiment signal">
            <ul className="space-y-3">
              {newsFeed.map((item) => (
                <li
                  key={item.title}
                  className="group flex flex-wrap items-center justify-between gap-2 rounded-xl border-b border-slate-100 bg-slate-50 px-3 py-3 transition-all duration-200 hover:bg-gray-50"
                >
                  <p className="text-sm text-[var(--color-primary)] transition-colors group-hover:text-slate-900">
                    {item.title}
                  </p>
                  <Badge label={item.sentiment} />
                </li>
              ))}
            </ul>
            </SectionContainer>
          </section>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
