import { ColumnConfig, CustomColumn } from '../types'

interface Props {
  columns: ColumnConfig[]
  customColumns: CustomColumn[]
  visibleColumns: string[]
  onToggle: (columnId: string) => void
  onToggleCustom: (columnId: string) => void
  onClose: () => void
}

export function ColumnToggle({ columns, customColumns, visibleColumns, onToggle, onToggleCustom, onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal column-toggle" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Filter Columns</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <h3 style={{ fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>Default Columns</h3>
        <ul className="column-list">
          {columns.map(col => (
            <li key={col.id} className="column-item">
              <input
                type="checkbox"
                className="checkbox"
                id={`col-${col.id}`}
                checked={visibleColumns.includes(col.id)}
                onChange={() => onToggle(col.id)}
              />
              <label htmlFor={`col-${col.id}`} className="checkbox-label">
                {col.label}
              </label>
            </li>
          ))}
        </ul>

        {customColumns.length > 0 && (
          <>
            <h3 style={{ fontSize: '14px', margin: '16px 0 8px', fontWeight: 600 }}>Custom Columns</h3>
            <ul className="column-list">
              {customColumns.map(col => (
                <li key={col.id} className="column-item">
                  <input
                    type="checkbox"
                    className="checkbox"
                    id={`col-${col.id}`}
                    checked={col.visible}
                    onChange={() => onToggleCustom(col.id)}
                  />
                  <label htmlFor={`col-${col.id}`} className="checkbox-label">
                    {col.label} <span style={{ color: '#6b7280', fontSize: '12px' }}>({col.type})</span>
                  </label>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
