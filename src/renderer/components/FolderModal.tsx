import { useState } from 'react'

interface Props {
  onSave: (name: string, color: string) => void
  onClose: () => void
}

const PRESET_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
]

export function FolderModal({ onSave, onClose }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSave(name.trim(), color)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2>New Folder</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Folder Name *</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Dream Companies"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Color</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: c,
                    border: color === c ? '3px solid #1a1a1a' : '2px solid #e5e7eb',
                    cursor: 'pointer'
                  }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                Custom color:
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{
                  width: '50px',
                  height: '40px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: '13px', color: '#9ca3af', fontFamily: 'monospace' }}>
                {color.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
