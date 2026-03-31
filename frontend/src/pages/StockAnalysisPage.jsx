import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import ErrorState from '../components/ErrorState'
import Loader from '../components/Loader'
import SectionContainer from '../components/SectionContainer'
import { Skeleton } from '../components/Skeleton'
import { analyzeStock } from '../services/stockAnalysisService'

const LOW_CONFIDENCE_THRESHOLD = 60

function normalizeLabel(value) {
  const next = String(value || '').trim().toUpperCase()
  return ['BUY', 'SELL', 'HOLD'].includes(next) ? next : 'HOLD'
}

function toDisplayItem(value, fallbackLabel = 'HOLD') {
  if (value && typeof value === 'object') {
    const label = normalizeLabel(value.label || value.signal || value.value || fallbackLabel)
    const textValue = String(value.value ?? value.text ?? value.label ?? label)
    return { label, value: textValue }
  }
  const text = String(value ?? fallbackLabel)
  return { label: normalizeLabel(text), value: text }
}

function normalizeNewsItem(item, index) {
  if (typeof item === 'string') return { id: `${item}-${index}`, title: item, sentiment: 'HOLD' }
  return {
    id: item?.id ?? `${item?.title ?? 'news'}-${index}`,
    title: item?.title ?? 'Untitled update',
    sentiment: normalizeLabel(item?.sentiment ?? item?.signal),
  }
}

function normalizeEventItem(item, index) {
  if (typeof item === 'string') return { id: `${item}-${index}`, name: item, detail: 'No additional details provided.' }
  return {
    id: item?.id ?? `${item?.name ?? 'event'}-${index}`,
    name: item?.name ?? 'Unnamed event',
    detail: item?.detail ?? item?.description ?? 'No additional details provided.',
  }
}

function normalizePricePoint(point, index) {
  if (typeof point === 'number') return { time: `P${index + 1}`, price: point }
  return {
    time: point?.time ?? point?.label ?? `P${index + 1}`,
    price: Number(point?.price ?? point?.value ?? 0),
  }
}

function isEmptyAnalysis(data) {
  if (!data) return true
  const hasCompany = Boolean(data.companyName)
  const hasSignal = Boolean(data.signal?.value || data.prediction?.value || data.sentiment?.value)
  const hasCollections = data.news.length > 0 || data.events.length > 0 || data.priceData.length > 0
  return !hasCompany && !hasSignal && !hasCollections
}

function SkeletonLoading() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div className="w-full max-w-md">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="mt-3 h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-44 rounded-md" />
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-5">
          <Skeleton className="h-4 w-36" />
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                <Skeleton className="h-3 w-20" />
                <div className="mt-3 flex items-center justify-between">
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-2 h-3 w-40" />
            </div>
            <Skeleton className="h-5 w-28" />
          </div>
          <Skeleton className="mt-4 h-72 w-full rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-2 h-3 w-52" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="rounded-md bg-slate-50 px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-2 h-3 w-40" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="rounded-md bg-slate-50 p-3">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="mt-2 h-3 w-full" />
                <Skeleton className="mt-2 h-3 w-4/5" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-4">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="mt-2 h-3 w-28" />
          <div className="mt-4 space-y-3">
            <div className="rounded-md bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-14" />
              </div>
              <Skeleton className="mt-3 h-2 w-full rounded-full" />
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="mt-2 h-3 w-36" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StockAnalysisPage() {
  const [searchSymbol, setSearchSymbol] = useState('')
  const [requestedSymbol, setRequestedSymbol] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [error, setError] = useState('')

  const parsed = useMemo(() => {
    if (!analysis) return null
    const sentiment = toDisplayItem(analysis.sentiment)
    const prediction = toDisplayItem(analysis.prediction)
    const risk = toDisplayItem(analysis.risk)
    const signal = toDisplayItem(analysis.signal)
    const confidence = Number(analysis.confidence ?? 0)
    const technical = analysis.technical ?? {}
    const seriesSource = technical.priceData ?? technical.priceSeries ?? analysis.priceData
    const priceData = Array.isArray(seriesSource) ? seriesSource.map(normalizePricePoint) : []
    const news = Array.isArray(analysis.news) ? analysis.news.map(normalizeNewsItem) : []
    const events = Array.isArray(analysis.events) ? analysis.events.map(normalizeEventItem) : []
    const signalSet = new Set([sentiment.label, prediction.label, signal.label].filter(Boolean))
    const mixedSignals = signalSet.size > 1
    const lowConfidence = confidence > 0 && confidence < LOW_CONFIDENCE_THRESHOLD

    return {
      symbol: requestedSymbol,
      companyName: analysis.company || 'Unknown company',
      sentiment,
      prediction,
      risk,
      signal: { ...signal, value: mixedSignals ? 'Mixed signals' : signal.value },
      confidence,
      lowConfidence,
      mixedSignals,
      technical: { rsi: technical.rsi ?? null, movingAverage: technical.movingAverage ?? null },
      news,
      events,
      explanation: analysis.explanation || 'No explanation available.',
      priceData,
      lastClose: priceData.length > 0 ? priceData[priceData.length - 1].price : null,
    }
  }, [analysis, requestedSymbol])

  const hasNoData = parsed && isEmptyAnalysis(parsed)

  const fetchStock = async (symbol) => {
    if (!symbol) return
    setIsLoading(true)
    setError('')
    setValidationError('')
    try {
      const data = await analyzeStock(symbol)
      setAnalysis(data ?? null)
      setRequestedSymbol(symbol)
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to fetch stock analysis. Please try again.')
      setAnalysis(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchSubmit = async (event) => {
    event.preventDefault()
    const symbol = searchSymbol.trim().toUpperCase()
    if (!symbol || !/^[A-Z.]{1,10}$/.test(symbol)) {
      setValidationError('Please enter a valid stock symbol (letters only, max 10 chars).')
      return
    }
    await fetchStock(symbol)
  }

  return (
    <div className="space-y-6">
      <SectionContainer
        title="Stock Analysis"
        subtitle="Search a symbol to fetch live model output"
        rightContent={isLoading ? <Loader text="Analyzing stock..." /> : null}
      >
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            value={searchSymbol}
            onChange={(event) => {
              setSearchSymbol(event.target.value.toUpperCase())
              if (validationError) setValidationError('')
            }}
            placeholder="Enter stock symbol"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-blue-100"
          />
          <Button
            type="submit"
            disabled={isLoading}
          >
            Analyze
          </Button>
        </form>
        {validationError && <p className="mt-3 text-sm text-red-600">{validationError}</p>}
        {error && (
          <ErrorState
            className="mt-3"
            title="API request failed"
            message={error}
            actionLabel="Retry"
            onAction={() => fetchStock(requestedSymbol || searchSymbol.trim().toUpperCase())}
          />
        )}
      </SectionContainer>

      {isLoading && <SkeletonLoading />}

      {!isLoading && !parsed && !error && (
        <SectionContainer title="No Analysis Yet" subtitle="Run a search to view stock details">
          <p className="text-sm text-slate-600">Enter a symbol like AAPL or MSFT and click Analyze.</p>
        </SectionContainer>
      )}

      {!isLoading && parsed && hasNoData && (
        <SectionContainer title="No Data Found" subtitle="The API returned an empty response for this symbol">
          <p className="text-sm text-slate-600">Try another symbol or retry in a moment.</p>
        </SectionContainer>
      )}

      {!isLoading && parsed && !hasNoData && (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">
                Detailed view for <span className="font-semibold text-[var(--color-primary)]">{parsed.symbol}</span>
              </p>
              <p className="mt-1 text-lg font-semibold text-[var(--color-primary)]">{parsed.companyName}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge label={parsed.signal.label} />
              {parsed.lowConfidence && (
                <span className="rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  Low confidence ({parsed.confidence}%)
                </span>
              )}
            </div>
          </div>

          {parsed.mixedSignals && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Mixed signals detected: sentiment, prediction, and signal are not aligned.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <SectionContainer title="Stock Summary" subtitle="High-level sentiment and model signal" className="lg:col-span-5">
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Card title="Sentiment">
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-[var(--color-primary)]">{parsed.sentiment.value}</p>
                    <Badge label={parsed.sentiment.label} />
                  </div>
                </Card>
                <Card title="Prediction">
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-[var(--color-primary)]">{parsed.prediction.value}</p>
                    <Badge label={parsed.prediction.label} />
                  </div>
                </Card>
                <Card title="Risk">
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-[var(--color-primary)]">{parsed.risk.value}</p>
                    <Badge label={parsed.risk.label} />
                  </div>
                </Card>
                <Card title="Signal">
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-[var(--color-primary)]">{parsed.signal.value}</p>
                    <Badge label={parsed.signal.label} />
                  </div>
                </Card>
              </div>
              <div className="mt-4 rounded-md bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-500">Model confidence</p>
                <p className="text-sm font-semibold text-[var(--color-primary)]">{parsed.confidence || 0}%</p>
              </div>
            </SectionContainer>

            <SectionContainer
              title="Price Chart"
              subtitle="Fetched price series"
              rightContent={parsed.lastClose !== null ? <span className="text-sm font-semibold text-slate-500">Last close: {parsed.lastClose}</span> : null}
              className="lg:col-span-7"
            >
              {parsed.priceData.length > 0 ? (
                <div className="h-72 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <LineChart data={parsed.priceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={['dataMin - 2', 'dataMax + 2']} />
                      <Tooltip />
                      <Line type="monotone" dataKey="price" stroke="#1E88E5" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="rounded-md bg-slate-50 px-3 py-8 text-center text-sm text-slate-500">No price chart data available.</div>
              )}
            </SectionContainer>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {parsed.news.length > 0 && (
              <SectionContainer title="Sentiment Details" subtitle="News items with sentiment labels" className="lg:col-span-5">
                <ul className="space-y-3">
                  {parsed.news.map((item) => (
                    <li
                      key={item.id}
                      className="group flex flex-wrap items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-2 transition-colors hover:bg-slate-100"
                    >
                      <p className="text-sm text-[var(--color-primary)]">{item.title}</p>
                      <Badge label={item.sentiment} />
                    </li>
                  ))}
                </ul>
              </SectionContainer>
            )}

            <SectionContainer
              title="Event Extraction"
              subtitle="Detected market-moving events"
              className={parsed.news.length > 0 ? 'lg:col-span-3' : 'lg:col-span-5'}
            >
              {parsed.events.length > 0 ? (
                <ul className="space-y-3">
                  {parsed.events.map((event) => (
                    <li key={event.id} className="rounded-md bg-slate-50 p-3">
                      <p className="text-sm font-semibold text-[var(--color-primary)]">{event.name}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{event.detail}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No events extracted for this symbol.</p>
              )}
            </SectionContainer>

            <SectionContainer
              title="Technical Indicators"
              subtitle="Quick snapshot"
              className={parsed.news.length > 0 ? 'lg:col-span-4' : 'lg:col-span-7'}
            >
              {parsed.technical.rsi !== null || parsed.technical.movingAverage !== null ? (
                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-md bg-slate-50 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600">RSI</p>
                      <p className="text-sm font-semibold text-[var(--color-primary)]">{parsed.technical.rsi ?? '--'}</p>
                    </div>
                    {parsed.technical.rsi !== null && (
                      <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-[var(--color-secondary)]"
                          style={{ width: `${Math.min(100, Math.max(0, Number(parsed.technical.rsi)))}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="rounded-md bg-slate-50 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600">Moving Average</p>
                      <p className="text-sm font-semibold text-[var(--color-primary)]">
                        {parsed.technical.movingAverage?.value ?? parsed.technical.movingAverage ?? '--'}
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Period: {parsed.technical.movingAverage?.period ? parsed.technical.movingAverage.period : 'Not provided'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-md bg-slate-50 px-3 py-8 text-center text-sm text-slate-500">
                  Technical data unavailable for this request.
                </div>
              )}
            </SectionContainer>
          </div>

          <SectionContainer title="Explanation Panel" subtitle="Why the model produced this prediction">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <p className="text-sm leading-6 text-slate-600">{parsed.explanation}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-[var(--color-primary)]">Status</h3>
                <ul className="mt-2 space-y-2 text-sm text-slate-600">
                  <li className="flex items-center justify-between gap-3">
                    <span>Sentiment</span>
                    <Badge label={parsed.sentiment.label} />
                  </li>
                  <li className="flex items-center justify-between gap-3">
                    <span>Prediction</span>
                    <Badge label={parsed.prediction.label} />
                  </li>
                  <li className="flex items-center justify-between gap-3">
                    <span>Signal</span>
                    <Badge label={parsed.signal.label} />
                  </li>
                </ul>
              </div>
            </div>
          </SectionContainer>
        </>
      )}
    </div>
  )
}

export default StockAnalysisPage
