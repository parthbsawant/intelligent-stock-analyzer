import { NavLink } from 'react-router-dom'

const features = [
  {
    title: 'Sentiment Analysis',
    description: 'Track market sentiment from news and social data streams to understand price pressure quickly.',
  },
  {
    title: 'Event Detection',
    description: 'Identify earnings calls, macro triggers, and abnormal market events as they happen.',
  },
  {
    title: 'Technical Analysis',
    description: 'Use chart-driven indicators and signal overlays to support confident trade decisions.',
  },
  {
    title: 'AI Predictions',
    description: 'Generate forward-looking insights from hybrid data pipelines powered by modern AI models.',
  },
]

const flowSteps = ['Data', 'NLP', 'DL', 'ML', 'Output']

function LandingPage() {
  return (
    <div className="space-y-20 py-6 md:py-10">
      <section className="rounded-2xl bg-white px-6 py-12 shadow-sm md:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-primary)] md:text-5xl">
            Smarter Stock Analysis for Modern Traders
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-600 md:text-lg">
            Analyze markets faster with AI-assisted insights, event detection, and technical signals in one clean
            workflow.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <NavLink
              to="/signup"
              className="rounded-md bg-[var(--color-secondary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Start Free
            </NavLink>
            <NavLink
              to="/login"
              className="rounded-md border border-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-slate-50"
            >
              Login
            </NavLink>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-[var(--color-primary)] md:text-3xl">Features</h2>
          <p className="mt-2 text-slate-600">Built for speed, clarity, and data-backed conviction.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[var(--color-primary)]">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white px-6 py-10 shadow-sm md:px-10">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-[var(--color-primary)] md:text-3xl">How It Works</h2>
          <p className="mt-2 text-slate-600">A streamlined intelligence pipeline from raw information to decisions.</p>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {flowSteps.map((step, index) => (
            <div key={step} className="flex items-center gap-3">
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-[var(--color-primary)]">
                {step}
              </span>
              {index < flowSteps.length - 1 && <span className="text-slate-400">{'->'}</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-[var(--color-primary)] px-6 py-12 text-center text-white md:px-10">
        <h2 className="text-2xl font-semibold md:text-3xl">Ready to improve your market edge?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
          Join traders using AI-driven workflows to reduce noise and focus on high-value opportunities.
        </p>
        <NavLink
          to="/signup"
          className="mt-7 inline-flex rounded-md bg-[var(--color-secondary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Create Your Account
        </NavLink>
      </section>
    </div>
  )
}

export default LandingPage
