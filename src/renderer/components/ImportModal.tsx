import { useState } from 'react'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { JobApplication, DEFAULT_COLUMNS } from '../types'

interface Props {
  onImport: (applications: JobApplication[]) => void
  onClose: () => void
}

export function ImportModal({ onImport, onClose }: Props) {
  const [fileData, setFileData] = useState<any[]>([])
  const [fileHeaders, setFileHeaders] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [step, setStep] = useState<'upload' | 'map'>('upload')

  const handleFileSelect = async () => {
    const result = await window.electronAPI.importFile()

    if (result.canceled || !result.success) {
      return
    }

    try {
      let data: any[] = []
      let headers: string[] = []

      if (result.extension === 'csv') {
        const csvText = atob(result.data!)
        const parsed = Papa.parse(csvText, { header: true })
        data = parsed.data
        headers = parsed.meta.fields || []
      } else if (result.extension === 'xlsx') {
        const binaryString = atob(result.data!)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const workbook = XLSX.read(bytes, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]

        // Parse with defval option to ensure all columns are captured
        data = XLSX.utils.sheet_to_json(firstSheet, { defval: '' })

        console.log('XLSX parsing debug:')
        console.log('- Sheet names:', workbook.SheetNames)
        console.log('- First sheet range:', firstSheet['!ref'])
        console.log('- Parsed rows:', data.length)
        console.log('- First row:', data[0])

        if (data.length > 0) {
          headers = Object.keys(data[0])
          console.log('- Detected headers:', headers)
        }
      }

      setFileData(data)
      setFileHeaders(headers)

      const autoMapping: Record<string, string> = {}
      DEFAULT_COLUMNS.forEach(col => {
        const match = headers.find(h =>
          h.toLowerCase() === col.label.toLowerCase() ||
          h.toLowerCase() === col.id.toLowerCase()
        )
        if (match) {
          autoMapping[col.id] = match
        }
      })

      setColumnMapping(autoMapping)
      setStep('map')
    } catch (error) {
      alert('Error reading file: ' + error)
    }
  }

  const handleImport = () => {
    const applications: JobApplication[] = fileData.map((row: any) => {
      const app: any = {
        id: crypto.randomUUID(),
        company: '',
        position: '',
        status: 'Applied',
        link: '',
        dateApplied: new Date().toISOString().split('T')[0],
        deadline: '',
        location: '',
        salary: '',
        notes: '',
        folderId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      Object.entries(columnMapping).forEach(([ourCol, theirCol]) => {
        if (theirCol && row[theirCol]) {
          app[ourCol] = String(row[theirCol])
        }
      })

      if (!app.company) {
        app.company = 'Unknown'
      }

      return app as JobApplication
    })

    onImport(applications)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h2>Import Applications</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {step === 'upload' ? (
          <div>
            <p style={{ marginBottom: '16px', color: '#6b7280' }}>
              Import job applications from a CSV or XLSX file.
            </p>
            <button className="btn btn-primary" onClick={handleFileSelect}>
              Select File
            </button>
          </div>
        ) : (
          <div>
            <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Map Columns</h3>
            <p style={{ marginBottom: '16px', color: '#6b7280', fontSize: '14px' }}>
              Match the columns from your file to our fields. Detected {fileData.length} rows and {fileHeaders.length} columns.
            </p>
            <div className="import-mapper">
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ fontSize: '14px' }}>Your File Columns → App Fields</strong>
              </div>
              {fileHeaders.map(header => {
                const mappedTo = Object.entries(columnMapping).find(([_, value]) => value === header)?.[0] || ''
                return (
                  <div key={header} className="mapper-row">
                    <div className="mapper-label" style={{ fontWeight: 500 }}>{header}</div>
                    <select
                      className="mapper-select"
                      value={mappedTo}
                      onChange={(e) => {
                        const newMapping = { ...columnMapping }
                        Object.keys(newMapping).forEach(key => {
                          if (newMapping[key] === header) {
                            delete newMapping[key]
                          }
                        })
                        if (e.target.value) {
                          newMapping[e.target.value] = header
                        }
                        setColumnMapping(newMapping)
                      }}
                    >
                      <option value="">-- Skip this column --</option>
                      {DEFAULT_COLUMNS.map(col => (
                        <option key={col.id} value={col.id}>{col.label}</option>
                      ))}
                    </select>
                  </div>
                )
              })}
            </div>

            {fileData.length > 0 && (
              <div className="preview-table">
                <h4 style={{ margin: '16px 0 8px', fontSize: '14px', fontWeight: 600 }}>
                  Preview (first 5 rows)
                </h4>
                <table>
                  <thead>
                    <tr>
                      {fileHeaders.slice(0, 6).map(header => (
                        <th key={header}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fileData.slice(0, 5).map((row, idx) => (
                      <tr key={idx}>
                        {fileHeaders.slice(0, 6).map(header => (
                          <td key={header}>{String(row[header] || '')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          {step === 'map' && (
            <>
              <button className="btn btn-secondary" onClick={() => setStep('upload')}>
                Back
              </button>
              <button className="btn btn-primary" onClick={handleImport}>
                Import {fileData.length} Applications
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
