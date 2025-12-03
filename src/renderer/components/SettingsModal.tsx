import { useState, useEffect } from 'react'
import { ThemeSettings } from '../types'

interface SettingsModalProps {
  settings: ThemeSettings
  onSave: (settings: ThemeSettings) => void
  onClose: () => void
}

const ACCENT_COLORS = [
  { name: 'Blue', value: '#3b82f6', hover: '#2563eb' },
  { name: 'Purple', value: '#8b5cf6', hover: '#7c3aed' },
  { name: 'Green', value: '#10b981', hover: '#059669' },
  { name: 'Orange', value: '#f59e0b', hover: '#d97706' },
  { name: 'Pink', value: '#ec4899', hover: '#db2777' },
  { name: 'Red', value: '#ef4444', hover: '#dc2626' },
  { name: 'Teal', value: '#14b8a6', hover: '#0d9488' },
  { name: 'Indigo', value: '#6366f1', hover: '#4f46e5' }
]

const BACKGROUND_PRESETS = {
  light: [
    { name: 'Default Light', bg: '#f8f9fa', secondary: '#ffffff' },
    { name: 'Warm White', bg: '#faf9f7', secondary: '#ffffff' },
    { name: 'Cool Gray', bg: '#f3f4f6', secondary: '#ffffff' },
    { name: 'Soft Blue', bg: '#f0f4f8', secondary: '#ffffff' },
    { name: 'Mint', bg: '#f0fdf4', secondary: '#ffffff' },
    { name: 'Lavender', bg: '#f5f3ff', secondary: '#ffffff' }
  ],
  dark: [
    { name: 'Default Dark', bg: '#1a1a1a', secondary: '#262626' },
    { name: 'Charcoal', bg: '#171717', secondary: '#262626' },
    { name: 'Midnight', bg: '#0f172a', secondary: '#1e293b' },
    { name: 'Dark Purple', bg: '#1e1b2e', secondary: '#2d2a3d' },
    { name: 'Dark Green', bg: '#0d1f1a', secondary: '#1a2f28' },
    { name: 'Dark Blue', bg: '#0a1929', secondary: '#1e2a3a' }
  ]
}

export const SettingsModal = ({ settings, onSave, onClose }: SettingsModalProps) => {
  const [darkMode, setDarkMode] = useState(settings.darkMode ?? true)
  const [accentColor, setAccentColor] = useState(settings.accentColor ?? '#3b82f6')
  const [accentColorHover, setAccentColorHover] = useState(settings.accentColorHover ?? '#2563eb')
  const [backgroundColor, setBackgroundColor] = useState(
    settings.backgroundColor ?? (settings.darkMode ? '#1a1a1a' : '#f8f9fa')
  )
  const [backgroundColorSecondary, setBackgroundColorSecondary] = useState(
    settings.backgroundColorSecondary ?? (settings.darkMode ? '#262626' : '#ffffff')
  )

  const handleSave = () => {
    onSave({
      darkMode,
      accentColor,
      accentColorHover,
      backgroundColor,
      backgroundColorSecondary
    })
    onClose()
  }

  const handleAccentColorChange = (color: string, hover: string) => {
    setAccentColor(color)
    setAccentColorHover(hover)
  }

  const handleBackgroundPresetChange = (bg: string, secondary: string) => {
    setBackgroundColor(bg)
    setBackgroundColorSecondary(secondary)
  }

  const currentBackgroundPresets = darkMode ? BACKGROUND_PRESETS.dark : BACKGROUND_PRESETS.light

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3 className="settings-section-title">Appearance</h3>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Theme Mode</label>
                <p className="setting-description">Choose between light and dark mode</p>
              </div>
              <div className="theme-toggle">
                <button
                  className={`theme-option ${!darkMode ? 'active' : ''}`}
                  onClick={() => setDarkMode(false)}
                >
                  Light
                </button>
                <button
                  className={`theme-option ${darkMode ? 'active' : ''}`}
                  onClick={() => setDarkMode(true)}
                >
                  Dark
                </button>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Accent Color</label>
                <p className="setting-description">Customize the primary color of the interface</p>
              </div>
              <div>
                <div className="color-picker">
                  {ACCENT_COLORS.map(color => (
                    <button
                      key={color.value}
                      className={`color-option ${accentColor === color.value ? 'selected' : ''}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => handleAccentColorChange(color.value, color.hover)}
                      title={color.name}
                    >
                      {accentColor === color.value && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M13.5 4.5L6 12L2.5 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: '#6b7280' }}>Custom:</label>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => {
                      setAccentColor(e.target.value)
                      const r = parseInt(e.target.value.slice(1, 3), 16)
                      const g = parseInt(e.target.value.slice(3, 5), 16)
                      const b = parseInt(e.target.value.slice(5, 7), 16)
                      const darkerR = Math.max(0, r - 30)
                      const darkerG = Math.max(0, g - 30)
                      const darkerB = Math.max(0, b - 30)
                      setAccentColorHover(`#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`)
                    }}
                    className="color-input"
                  />
                  <span style={{ fontSize: '13px', color: '#9ca3af', fontFamily: 'monospace' }}>{accentColor}</span>
                </div>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Background Colors</label>
                <p className="setting-description">Choose a background theme or customize colors</p>
              </div>
              <div>
                <div className="background-presets">
                  {currentBackgroundPresets.map(preset => (
                    <button
                      key={preset.name}
                      className={`background-preset ${backgroundColor === preset.bg ? 'selected' : ''}`}
                      onClick={() => handleBackgroundPresetChange(preset.bg, preset.secondary)}
                      title={preset.name}
                    >
                      <div className="preset-colors">
                        <div className="preset-color-main" style={{ backgroundColor: preset.bg }} />
                        <div className="preset-color-secondary" style={{ backgroundColor: preset.secondary }} />
                      </div>
                      <span className="preset-name">{preset.name}</span>
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '13px', color: '#6b7280', width: '80px' }}>Primary:</label>
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="color-input"
                    />
                    <span style={{ fontSize: '13px', color: '#9ca3af', fontFamily: 'monospace' }}>{backgroundColor}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '13px', color: '#6b7280', width: '80px' }}>Secondary:</label>
                    <input
                      type="color"
                      value={backgroundColorSecondary}
                      onChange={(e) => setBackgroundColorSecondary(e.target.value)}
                      className="color-input"
                    />
                    <span style={{ fontSize: '13px', color: '#9ca3af', fontFamily: 'monospace' }}>{backgroundColorSecondary}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
