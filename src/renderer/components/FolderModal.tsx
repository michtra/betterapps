import { useState } from 'react'
import { Folder } from '../types'

interface Props {
  folder?: Folder | null
  onSave: (name: string, color: string, wallpaper?: string) => void
  onClose: () => void
}

const PRESET_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
]

export function FolderModal({ folder, onSave, onClose }: Props) {
  const [name, setName] = useState(folder?.name || '')
  const [color, setColor] = useState(folder?.color || PRESET_COLORS[0])
  const [wallpaper, setWallpaper] = useState(folder?.wallpaper || '')
  const [wallpaperType, setWallpaperType] = useState<'color' | 'image'>(
    folder?.wallpaper?.startsWith('data:image') ? 'image' : 'color'
  )

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setWallpaper(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSave(name.trim(), color, wallpaper || undefined)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2>{folder ? 'Edit Folder' : 'New Folder'}</h2>
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
          <div className="form-group">
            <label>Background Wallpaper (Optional)</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setWallpaperType('color')}
                style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  border: wallpaperType === 'color' ? '2px solid var(--accent-color)' : '1px solid #e5e7eb',
                  borderRadius: '6px',
                  background: wallpaperType === 'color' ? 'var(--accent-color)' : 'white',
                  color: wallpaperType === 'color' ? 'white' : '#6b7280',
                  cursor: 'pointer',
                  fontWeight: wallpaperType === 'color' ? '500' : '400'
                }}
              >
                Color
              </button>
              <button
                type="button"
                onClick={() => setWallpaperType('image')}
                style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  border: wallpaperType === 'image' ? '2px solid var(--accent-color)' : '1px solid #e5e7eb',
                  borderRadius: '6px',
                  background: wallpaperType === 'image' ? 'var(--accent-color)' : 'white',
                  color: wallpaperType === 'image' ? 'white' : '#6b7280',
                  cursor: 'pointer',
                  fontWeight: wallpaperType === 'image' ? '500' : '400'
                }}
              >
                Image
              </button>
            </div>

            {wallpaperType === 'color' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="color"
                  value={wallpaper?.startsWith('#') ? wallpaper : '#ffffff'}
                  onChange={(e) => setWallpaper(e.target.value)}
                  style={{
                    width: '50px',
                    height: '40px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '13px', color: '#9ca3af', fontFamily: 'monospace' }}>
                  {wallpaper?.startsWith('#') ? wallpaper.toUpperCase() : 'None'}
                </span>
                {wallpaper && (
                  <button
                    type="button"
                    onClick={() => setWallpaper('')}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{
                    fontSize: '13px',
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    width: '100%',
                    cursor: 'pointer'
                  }}
                />
                {wallpaper?.startsWith('data:image') && (
                  <div style={{ marginTop: '12px', position: 'relative' }}>
                    <img
                      src={wallpaper}
                      alt="Wallpaper preview"
                      style={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '2px solid #e5e7eb'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setWallpaper('')}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        background: 'white',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}
            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px', marginBottom: 0 }}>
              This wallpaper will be applied when viewing this folder's applications
            </p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {folder ? 'Save' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
