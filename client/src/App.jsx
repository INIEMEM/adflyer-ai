import { useState, useEffect } from 'react'
import Header from './components/Header'
import GeneratorForm from './components/GeneratorForm'
import StepTracker from './components/StepTracker'
import ResultsPanel from './components/ResultsPanel'
import './index.css'

const INITIAL_FORM = {
  businessName: '',
  businessType: '',
  productOrService: '',
  targetLocation: '',
  specialOffer: '',
  contactInfo: '',
}

const SERVER_URL = (import.meta.env.VITE_API_URL || 'https://adflyer-ai.onrender.com').replace(/\/$/, '')

export default function App() {
  const [formData,       setFormData]       = useState(INITIAL_FORM)
  const [results,        setResults]        = useState(null)
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState(null)
  const [serverDown,     setServerDown]     = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  // ── Health check on mount ─────────────────────────────────────────────────
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/health`, { signal: AbortSignal.timeout(4000) })
        if (!res.ok) throw new Error('not ok')
        setServerDown(false)
      } catch {
        setServerDown(true)
      }
    }
    check()
  }, [])

  // ── Form handlers ─────────────────────────────────────────────────────────
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const res = await fetch(`${SERVER_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const json = await res.json()

      if (!json.success) {
        throw new Error(json.error || 'Generation failed. Please try again.')
      }

      setResults(json.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResults(null)
    setError(null)
    setFormData(INITIAL_FORM)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <Header />

      {/* Server-down banner */}
      {serverDown && !bannerDismissed && (
        <div className="server-banner" role="alert">
          <span className="server-banner-text">
            ⚠️ Cannot connect to server. Make sure the backend is running on port 5000.
          </span>
          <button
            className="server-banner-dismiss"
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      <main className="app-main">
        {/* Error banner — generation failure */}
        {error && !loading && !results && (
          <div className="error-banner" role="alert">
            <span className="error-banner-icon">⚠️</span>
            <div>
              <strong>Something went wrong:</strong> {error}
              <br />
              <span style={{ opacity: 0.75, fontSize: '0.86rem' }}>
                Make sure the backend environment variables are set and the API server is running.
              </span>
            </div>
          </div>
        )}

        {/* Step tracker — loading state */}
        {loading && <StepTracker key={Date.now()} />}

        {/* Results panel */}
        {!loading && results && (
          <ResultsPanel results={results} onReset={handleReset} />
        )}

        {/* Generator form — idle or after error */}
        {!loading && !results && (
          <GeneratorForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            loading={loading}
          />
        )}
      </main>
    </div>
  )
}
