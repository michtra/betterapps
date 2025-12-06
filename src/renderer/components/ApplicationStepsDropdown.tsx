import { useState, useRef, useEffect } from 'react'
import './ApplicationStepsDropdown.css'
import { ApplicationStep } from '../types'

interface ApplicationStepsDropdownProps {
  steps: ApplicationStep[]
  onUpdateSteps: (steps: ApplicationStep[]) => void
}

const DEFAULT_STEPS = [
  'Resume submitted',
  'Cover letter written',
  'Application submitted',
  'Follow-up sent',
  'Phone screen scheduled',
  'Interview scheduled',
  'Thank you note sent'
]

export function ApplicationStepsDropdown({ steps, onUpdateSteps }: ApplicationStepsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newStepLabel, setNewStepLabel] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Initialize steps if empty
  const currentSteps = steps.length > 0 ? steps : DEFAULT_STEPS.map((label, index) => ({
    id: `step-${index}`,
    label,
    completed: false
  }))

  useEffect(() => {
    // Initialize default steps if none exist
    if (steps.length === 0) {
      onUpdateSteps(currentSteps)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const toggleStep = (stepId: string) => {
    const updated = currentSteps.map(step =>
      step.id === stepId ? { ...step, completed: !step.completed } : step
    )
    onUpdateSteps(updated)
  }

  const addCustomStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (newStepLabel.trim()) {
      const newStep: ApplicationStep = {
        id: `custom-${Date.now()}`,
        label: newStepLabel.trim(),
        completed: false
      }
      onUpdateSteps([...currentSteps, newStep])
      setNewStepLabel('')
    }
  }

  const deleteStep = (stepId: string) => {
    const updated = currentSteps.filter(step => step.id !== stepId)
    onUpdateSteps(updated)
  }

  const completedCount = currentSteps.filter(s => s.completed).length
  const totalCount = currentSteps.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="app-steps-dropdown" ref={dropdownRef}>
      <button
        className="app-steps-toggle"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        title="View application progress"
      >
        <span className="progress-indicator">
          📋 {completedCount}/{totalCount}
        </span>
        <span className="progress-bar-mini">
          <span
            className="progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </span>
      </button>

      {isOpen && (
        <div className="app-steps-content" onClick={(e) => e.stopPropagation()}>
          <div className="app-steps-header">
            <h4>Application Progress</h4>
            <div className="progress-text">{progressPercent}% complete</div>
          </div>

          <div className="app-steps-list">
            {currentSteps.map(step => (
              <div key={step.id} className="app-step-item">
                <input
                  type="checkbox"
                  checked={step.completed}
                  onChange={() => toggleStep(step.id)}
                  className="app-step-checkbox"
                />
                <span className={`app-step-label ${step.completed ? 'completed' : ''}`}>
                  {step.label}
                </span>
                {step.id.startsWith('custom-') && (
                  <button
                    onClick={() => deleteStep(step.id)}
                    className="app-step-delete"
                    title="Delete custom step"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={addCustomStep} className="app-step-add-form">
            <input
              type="text"
              value={newStepLabel}
              onChange={(e) => setNewStepLabel(e.target.value)}
              placeholder="Add custom step..."
              className="app-step-input"
            />
            <button type="submit" className="app-step-add-btn">+</button>
          </form>
        </div>
      )}
    </div>
  )
}
