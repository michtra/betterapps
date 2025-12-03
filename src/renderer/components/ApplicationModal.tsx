import { useState, useEffect } from 'react'
import { JobApplication, Folder, ApplicationStatus, CustomColumn } from '../types'

interface Props {
  application: JobApplication | null
  folders: Folder[]
  customColumns: CustomColumn[]
  onSave: (app: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => void
  onClose: () => void
}

export function ApplicationModal({ application, folders, customColumns, onSave, onClose }: Props) {
  const [company, setCompany] = useState(application?.company || '')
  const [position, setPosition] = useState(application?.position || '')
  const [status, setStatus] = useState<ApplicationStatus>(application?.status || 'Wishlist')
  const [link, setLink] = useState(application?.link || '')
  const [dateApplied, setDateApplied] = useState(
    application?.dateApplied || new Date().toISOString().split('T')[0]
  )
  const [deadline, setDeadline] = useState(application?.deadline || '')
  const [location, setLocation] = useState(application?.location || '')
  const [salary, setSalary] = useState(application?.salary || '')
  const [notes, setNotes] = useState(application?.notes || '')
  const [folderId, setFolderId] = useState<string | null>(application?.folderId || null)
  const [customFields, setCustomFields] = useState<Record<string, any>>(application?.customFields || {})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      company,
      position,
      status,
      link,
      dateApplied,
      deadline,
      location,
      salary,
      notes,
      folderId,
      customFields
    })
  }

  const handleCustomFieldChange = (columnId: string, value: any) => {
    setCustomFields(prev => ({ ...prev, [columnId]: value }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{application ? 'Edit Application' : 'New Application'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Company *</label>
            <input
              type="text"
              className="form-input"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Position</label>
            <input
              type="text"
              className="form-input"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Status *</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
            >
              <option value="Wishlist">Wishlist</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date Applied</label>
            <input
              type="date"
              className="form-input"
              value={dateApplied}
              onChange={(e) => setDateApplied(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Deadline</label>
            <input
              type="date"
              className="form-input"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="Optional application deadline"
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              className="form-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., San Francisco, CA"
            />
          </div>
          <div className="form-group">
            <label>Salary Range</label>
            <input
              type="text"
              className="form-input"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="e.g., $100k - $150k"
            />
          </div>
          <div className="form-group">
            <label>Link</label>
            <input
              type="text"
              className="form-input"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="form-group">
            <label>Folder</label>
            <select
              className="form-select"
              value={folderId || ''}
              onChange={(e) => setFolderId(e.target.value || null)}
            >
              <option value="">No Folder</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              className="form-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this application..."
            />
          </div>
          {customColumns.map(col => (
            <div key={col.id} className="form-group">
              <label>{col.label}</label>
              {col.type === 'text' ? (
                <input
                  type="text"
                  className="form-input"
                  value={customFields[col.id] || ''}
                  onChange={(e) => handleCustomFieldChange(col.id, e.target.value)}
                />
              ) : col.type === 'number' ? (
                <input
                  type="number"
                  className="form-input"
                  value={customFields[col.id] || ''}
                  onChange={(e) => handleCustomFieldChange(col.id, e.target.value)}
                />
              ) : col.type === 'date' ? (
                <input
                  type="date"
                  className="form-input"
                  value={customFields[col.id] || ''}
                  onChange={(e) => handleCustomFieldChange(col.id, e.target.value)}
                />
              ) : col.type === 'dropdown' ? (
                <select
                  className="form-select"
                  value={customFields[col.id] || ''}
                  onChange={(e) => handleCustomFieldChange(col.id, e.target.value)}
                >
                  <option value="">Select...</option>
                  {col.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : null}
            </div>
          ))}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {application ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
