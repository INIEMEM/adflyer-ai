import { useState } from 'react'

const COPY_SECTIONS = [
  { key: 'headline',         icon: '📢', label: 'Headline',          styleClass: 'headline' },
  { key: 'adText',           icon: '📝', label: 'Ad Text',           styleClass: '' },
  { key: 'callToAction',     icon: '🎯', label: 'Call to Action',    styleClass: 'cta' },
  { key: 'facebookCaption',  icon: '📘', label: 'Facebook Caption',  styleClass: '' },
  { key: 'whatsappCaption',  icon: '💬', label: 'WhatsApp Caption',  styleClass: '' },
]

function CopyCard({ icon, label, text, styleClass }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="copy-card">
      <div className="copy-card-header">
        <span className="copy-card-label">
          {icon} {label}
        </span>
        <button
          className={`btn-copy ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          aria-label={`Copy ${label}`}
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <p className={`copy-text ${styleClass}`}>{text}</p>
    </div>
  )
}

async function downloadImage(url, filename) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(objectUrl)
  } catch {
    // Fallback: open in new tab if fetch fails (cross-origin)
    window.open(url, '_blank', 'noreferrer')
  }
}

export default function ResultsPanel({ results, onReset }) {
  const filename = `adflyer-${Date.now()}.png`

  return (
    <div className="results-panel">
      {/* Top bar */}
      <div className="results-topbar">
        <h2 className="results-title">
          Your <span>Ad</span> is Ready
        </h2>
        <button className="btn-back" onClick={onReset}>
          ← Generate Another
        </button>
      </div>

      <div className="results-grid">
        {/* LEFT — Flyer image */}
        <div className="flyer-col">
          <a
            href={results.imageUrl}
            target="_blank"
            rel="noreferrer"
            className="flyer-image-box"
            aria-label="Open flyer in new tab"
          >
            <img
              src={results.imageUrl}
              alt="Generated advertising flyer"
            />
            <div className="flyer-open-hint">
              <span className="flyer-open-hint-inner">🔗 Open Full Size</span>
            </div>
          </a>

          <button
            className="btn-download"
            onClick={() => downloadImage(results.imageUrl, filename)}
          >
            ⬇ Download Flyer
          </button>
        </div>

        {/* RIGHT — Copy sections */}
        <div className="copy-col">
          {COPY_SECTIONS.map(({ key, icon, label, styleClass }) => (
            <CopyCard
              key={key}
              icon={icon}
              label={label}
              text={results[key] || ''}
              styleClass={styleClass}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
