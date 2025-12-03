import { useState } from 'react'
import { CustomColumn, FieldType } from '../types'

interface Props {
  columns: CustomColumn[]
  onSave: (columns: CustomColumn[]) => void
  onClose: () => void
}

export function CustomColumnsModal({ columns, onSave, onClose }: Props) {
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>(columns)
  const [newColumnName, setNewColumnName] = useState('')
  const [newColumnType, setNewColumnType] = useState<FieldType>('text')
  const [newColumnOptions, setNewColumnOptions] = useState('')

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return

    const newColumn: CustomColumn = {
      id: `custom_${Date.now()}`,
      label: newColumnName.trim(),
      type: newColumnType,
      options: newColumnType === 'dropdown' ? newColumnOptions.split(',').map(o => o.trim()).filter(Boolean) : undefined,
      visible: true,
      width: 150
    }

    setCustomColumns([...customColumns, newColumn])
    setNewColumnName('')
    setNewColumnOptions('')
    setNewColumnType('text')
  }

  const handleDeleteColumn = (id: string) => {
    setCustomColumns(customColumns.filter(col => col.id !== id))
  }

  const handleSave = () => {
    onSave(customColumns)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2>Manage Custom Columns</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '12px', fontWeight: 600 }}>Add New Column</h3>
          <div className="form-group">
            <label>Column Name</label>
            <input
              type="text"
              className="form-input"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="e.g., Interview Round"
            />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select
              className="form-select"
              value={newColumnType}
              onChange={(e) => setNewColumnType(e.target.value as FieldType)}
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="dropdown">Dropdown</option>
            </select>
          </div>
          {newColumnType === 'dropdown' && (
            <div className="form-group">
              <label>Options (comma-separated)</label>
              <input
                type="text"
                className="form-input"
                value={newColumnOptions}
                onChange={(e) => setNewColumnOptions(e.target.value)}
                placeholder="e.g., Phone Screen, Technical, Final"
              />
            </div>
          )}
          <button className="btn btn-primary" onClick={handleAddColumn}>
            Add Column
          </button>
        </div>

        <div>
          <h3 style={{ fontSize: '14px', marginBottom: '12px', fontWeight: 600 }}>Custom Columns</h3>
          {customColumns.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '14px' }}>No custom columns yet</p>
          ) : (
            <ul className="column-list">
              {customColumns.map(col => (
                <li key={col.id} className="column-item">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{col.label}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Type: {col.type}
                      {col.options && ` (${col.options.join(', ')})`}
                    </div>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteColumn(col.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
