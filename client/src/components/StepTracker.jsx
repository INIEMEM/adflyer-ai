import { useState, useEffect } from 'react'

const STEPS = [
  { icon: '🔍', label: 'Researching your market...' },
  { icon: '✍️', label: 'Writing your ad copy...' },
  { icon: '🎨', label: 'Designing flyer concept...' },
  { icon: '🖼️', label: 'Generating your flyer...' },
]

export default function StepTracker() {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep(prev => {
        if (prev < STEPS.length - 1) return prev + 1
        clearInterval(timer)
        return prev
      })
    }, 6000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="step-tracker">
      <h2 className="step-tracker-heading">Building Your Ad</h2>
      <p className="step-tracker-sub">Our AI pipeline is working — this takes about 30–60 seconds</p>

      <ul className="steps-list">
        {STEPS.map((step, i) => {
          const isDone   = i < activeStep
          const isActive = i === activeStep
          const state    = isDone ? 'done' : isActive ? 'active' : 'upcoming'

          return (
            <li key={step.label} className={`step-item ${state}`}>
              <span className="step-icon">{step.icon}</span>
              <span className="step-label">{step.label}</span>
              {isDone   && <span className="step-status-icon">✓</span>}
              {isActive && (
                <span className="step-status-icon">
                  <MiniSpinner />
                </span>
              )}
            </li>
          )
        })}
      </ul>

      <div className="pulse-spinner" />
      <p className="pulse-label">AI processing…</p>
    </div>
  )
}

function MiniSpinner() {
  return (
    <span style={{
      display: 'inline-block',
      width: 14,
      height: 14,
      border: '2px solid rgba(0,255,135,0.3)',
      borderTopColor: '#00ff87',
      borderRadius: '50%',
      animation: 'spin 0.75s linear infinite',
    }} />
  )
}
