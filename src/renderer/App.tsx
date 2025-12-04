import { useState, useEffect, useMemo } from 'react'
import './App.css'
import {
  JobApplication,
  Folder,
  AppData,
  DEFAULT_COLUMNS,
  ApplicationStatus,
  STATUS_COLORS
} from './types'
import { ApplicationModal } from './components/ApplicationModal'
import { ColumnToggle } from './components/ColumnToggle'
import { ImportModal } from './components/ImportModal'
import { FolderModal } from './components/FolderModal'
import { CustomColumnsModal } from './components/CustomColumnsModal'
import { SettingsModal } from './components/SettingsModal'
import { DraggableRow } from './components/DraggableRow'
import { DroppableFolder } from './components/DroppableFolder'
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CustomColumn } from './types'

function App() {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    DEFAULT_COLUMNS.filter(c => c.visible).map(c => c.id)
  )
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [showColumnToggle, setShowColumnToggle] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [showCustomColumnsModal, setShowCustomColumnsModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([])
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [sortBy, setSortBy] = useState<keyof JobApplication>('dateApplied')
  const [sortDesc, setSortDesc] = useState(true)
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [accentColor, setAccentColor] = useState('#3b82f6')
  const [accentColorHover, setAccentColorHover] = useState('#2563eb')
  const [backgroundColor, setBackgroundColor] = useState('#f8f9fa')
  const [backgroundColorSecondary, setBackgroundColorSecondary] = useState('#ffffff')
  const [draggedApp, setDraggedApp] = useState<JobApplication | null>(null)
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set())

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }, [darkMode])

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor)
    document.documentElement.style.setProperty('--accent-color-hover', accentColorHover)
    document.documentElement.style.setProperty('--bg-primary', backgroundColor)
    document.documentElement.style.setProperty('--bg-secondary', backgroundColorSecondary)
  }, [accentColor, accentColorHover, backgroundColor, backgroundColorSecondary])

  useEffect(() => {
    saveData()
  }, [darkMode, visibleColumns, customColumns, accentColor, accentColorHover, backgroundColor, backgroundColorSecondary])

  const loadData = async () => {
    const data: AppData = await window.electronAPI.loadData()
    setApplications(data.applications || [])

    const loadedFolders = data.folders || []
    const foldersWithOrder = loadedFolders.map((folder, index) => ({
      ...folder,
      order: folder.order !== undefined ? folder.order : index
    })).sort((a, b) => (a.order || 0) - (b.order || 0))
    setFolders(foldersWithOrder)

    if (data.settings?.visibleColumns?.length > 0) {
      setVisibleColumns(data.settings.visibleColumns)
    }
    if (data.settings?.darkMode !== undefined) {
      setDarkMode(data.settings.darkMode)
    }
    if (data.settings?.customColumns) {
      setCustomColumns(data.settings.customColumns)
    }
    if (data.settings?.accentColor) {
      setAccentColor(data.settings.accentColor)
    }
    if (data.settings?.accentColorHover) {
      setAccentColorHover(data.settings.accentColorHover)
    }
    if (data.settings?.backgroundColor) {
      setBackgroundColor(data.settings.backgroundColor)
    }
    if (data.settings?.backgroundColorSecondary) {
      setBackgroundColorSecondary(data.settings.backgroundColorSecondary)
    }
  }

  const saveData = async (updatedApplications?: JobApplication[], updatedFolders?: Folder[]) => {
    const data: AppData = {
      applications: updatedApplications || applications,
      folders: updatedFolders || folders,
      settings: { visibleColumns, darkMode, customColumns, accentColor, accentColorHover, backgroundColor, backgroundColorSecondary }
    }
    const result = await window.electronAPI.saveData(data)
    if (!result.success) {
      console.error('Failed to save data:', result.error)
      alert('Error saving data: ' + result.error)
    }
  }

  const addApplication = (app: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newApp: JobApplication = {
      ...app,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const updated = [...applications, newApp]
    setApplications(updated)
    saveData(updated)
  }

  const updateApplication = (id: string, updates: Partial<JobApplication>) => {
    const updated = applications.map(app =>
      app.id === id ? { ...app, ...updates, updatedAt: new Date().toISOString() } : app
    )
    setApplications(updated)
    saveData(updated)
  }

  const deleteApplication = (id: string) => {
    const updated = applications.filter(app => app.id !== id)
    setApplications(updated)
    setSelectedApplications(new Set())
    saveData(updated)
  }

  const bulkDeleteApplications = () => {
    if (selectedApplications.size === 0) return

    if (confirm(`Delete ${selectedApplications.size} selected application(s)?`)) {
      const updated = applications.filter(app => !selectedApplications.has(app.id))
      setApplications(updated)
      setSelectedApplications(new Set())
      saveData(updated)
    }
  }

  const clearAllApplications = () => {
    if (applications.length === 0) return

    if (confirm(`Delete ALL ${applications.length} application(s)? This action cannot be undone.`)) {
      setApplications([])
      setSelectedApplications(new Set())
      saveData([])
    }
  }

  const toggleSelectApplication = (id: string) => {
    const newSelected = new Set(selectedApplications)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedApplications(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedApplications.size === filteredApplications.length) {
      setSelectedApplications(new Set())
    } else {
      setSelectedApplications(new Set(filteredApplications.map(app => app.id)))
    }
  }

  const addFolder = (name: string, color: string, wallpaper?: string) => {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      color,
      wallpaper,
      createdAt: new Date().toISOString(),
      order: folders.length
    }
    const updated = [...folders, newFolder]
    setFolders(updated)
    saveData(undefined, updated)
  }

  const updateFolder = (id: string, name: string, color: string, wallpaper?: string) => {
    const updated = folders.map(f =>
      f.id === id ? { ...f, name, color, wallpaper } : f
    )
    setFolders(updated)
    saveData(undefined, updated)
  }

  const deleteFolder = (id: string) => {
    const updatedFolders = folders.filter(f => f.id !== id)
    const updatedApplications = applications.map(app =>
      app.folderId === id ? { ...app, folderId: null } : app
    )
    setFolders(updatedFolders)
    setApplications(updatedApplications)
    if (selectedFolder === id) {
      setSelectedFolder(null)
    }
    saveData(updatedApplications, updatedFolders)
  }

  useEffect(() => {
    setSelectedApplications(new Set())
  }, [selectedFolder, searchQuery])

  const filteredApplications = useMemo(() => {
    let filtered = applications

    if (selectedFolder !== null) {
      filtered = filtered.filter(app => app.folderId === selectedFolder)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(app =>
        app.company.toLowerCase().includes(query) ||
        app.position.toLowerCase().includes(query) ||
        app.notes.toLowerCase().includes(query) ||
        app.location.toLowerCase().includes(query)
      )
    }

    return filtered.sort((a, b) => {
      let aVal: any
      let bVal: any

      // Check if it's a custom column
      if (sortBy.toString().startsWith('custom_')) {
        aVal = a.customFields?.[sortBy] || ''
        bVal = b.customFields?.[sortBy] || ''

        // Find the custom column type
        const customCol = customColumns.find(col => col.id === sortBy)
        if (customCol?.type === 'number') {
          aVal = parseFloat(aVal) || 0
          bVal = parseFloat(bVal) || 0
        } else if (customCol?.type === 'date') {
          aVal = new Date(aVal || 0).getTime()
          bVal = new Date(bVal || 0).getTime()
        }
      } else {
        aVal = a[sortBy] || ''
        bVal = b[sortBy] || ''

        // Handle date columns
        if (sortBy === 'dateApplied' || sortBy === 'deadline' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
          aVal = new Date(aVal || 0).getTime()
          bVal = new Date(bVal || 0).getTime()
        }
      }

      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      return sortDesc ? -comparison : comparison
    })
  }, [applications, selectedFolder, searchQuery, sortBy, sortDesc, customColumns])

  const handleSort = (column: keyof JobApplication) => {
    if (sortBy === column) {
      setSortDesc(!sortDesc)
    } else {
      setSortBy(column)
      setSortDesc(false)
    }
  }

  const handleExport = async (format: 'csv' | 'xlsx') => {
    let data: string

    if (format === 'csv') {
      const headers = visibleColumns.join(',')
      const rows = filteredApplications.map(app =>
        visibleColumns.map(col => {
          const value = app[col as keyof JobApplication]
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        }).join(',')
      )
      data = [headers, ...rows].join('\n')
    } else {
      const XLSX = await import('xlsx')
      const worksheet = XLSX.utils.json_to_sheet(
        filteredApplications.map(app => {
          const obj: any = {}
          visibleColumns.forEach(col => {
            const config = DEFAULT_COLUMNS.find(c => c.id === col)
            obj[config?.label || col] = app[col as keyof JobApplication]
          })
          return obj
        })
      )
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications')
      data = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' })
    }

    await window.electronAPI.exportFile(data, format)
  }

  const handleEdit = (app: JobApplication) => {
    setEditingApplication(app)
    setShowApplicationModal(true)
  }

  const handleModalClose = () => {
    setShowApplicationModal(false)
    setEditingApplication(null)
  }

  const handleDragStart = (event: any) => {
    const app = applications.find(a => a.id === event.active.id)
    setDraggedApp(app || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setDraggedApp(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Check if we're dragging a folder
    const draggedFolder = folders.find(f => f.id === activeId)
    if (draggedFolder) {
      // Handle folder reordering
      const oldIndex = folders.findIndex(f => f.id === activeId)
      const newIndex = folders.findIndex(f => f.id === overId)

      if (oldIndex !== newIndex) {
        const reorderedFolders = arrayMove(folders, oldIndex, newIndex).map((folder, index) => ({
          ...folder,
          order: index
        }))
        setFolders(reorderedFolders)
        saveData(undefined, reorderedFolders)
      }
      return
    }

    // Otherwise, handle application dragging to folders
    const folderId = overId === 'all' ? null : overId
    const app = applications.find(a => a.id === activeId)
    if (app && app.folderId !== folderId) {
      updateApplication(activeId, { folderId })
    }
  }

  const visibleColumnsConfig = DEFAULT_COLUMNS.filter(col => visibleColumns.includes(col.id))
  const visibleCustomColumns = customColumns.filter(col => col.visible)
  const allVisibleColumns = [...visibleColumnsConfig, ...visibleCustomColumns.map(col => ({ ...col, id: col.id as any }))]

  const currentFolder = selectedFolder ? folders.find(f => f.id === selectedFolder) : null
  const contentAreaStyle: React.CSSProperties = currentFolder?.wallpaper
    ? currentFolder.wallpaper.startsWith('data:image')
      ? {
          backgroundImage: `url(${currentFolder.wallpaper})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }
      : { backgroundColor: currentFolder.wallpaper }
    : {}

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
    <div className="app">
      <header className="header">
        <div className="header-title">
          <h1>clovern</h1>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary btn-small" onClick={() => setShowSettingsModal(true)}>
            Settings
          </button>
          <button className="btn btn-secondary btn-small" onClick={() => setShowColumnToggle(true)}>
            Filter
          </button>
          <button className="btn btn-secondary btn-small" onClick={() => setShowCustomColumnsModal(true)}>
            Modify Fields
          </button>
          <button className="btn btn-secondary btn-small" onClick={() => setShowImportModal(true)}>
            Import
          </button>
          <div className="dropdown">
            <button
              className="btn btn-secondary btn-small"
              onClick={() => setShowExportDropdown(!showExportDropdown)}
            >
              Export
            </button>
            {showExportDropdown && (
              <div className="dropdown-content">
                <button className="dropdown-item" onClick={() => { handleExport('csv'); setShowExportDropdown(false); }}>
                  Export as CSV
                </button>
                <button className="dropdown-item" onClick={() => { handleExport('xlsx'); setShowExportDropdown(false); }}>
                  Export as XLSX
                </button>
              </div>
            )}
          </div>
          <button className="btn btn-primary" onClick={() => setShowApplicationModal(true)}>
            + New Application
          </button>
        </div>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <div className="sidebar-section">
            <h3>Folders</h3>
            <ul className="folder-list">
              <DroppableFolder
                id="all"
                className={`folder-item ${selectedFolder === null ? 'active' : ''}`}
                onClick={() => setSelectedFolder(null)}
              >
                <span className="folder-name">All Applications</span>
                <span className="folder-count">{applications.length}</span>
              </DroppableFolder>
              <SortableContext
                items={folders.map(f => f.id)}
                strategy={verticalListSortingStrategy}
              >
                {folders.map(folder => (
                  <DroppableFolder
                    key={folder.id}
                    id={folder.id}
                    sortable={true}
                    className={`folder-item ${selectedFolder === folder.id ? 'active' : ''}`}
                  >
                    <div
                      className="folder-content"
                      onClick={(e) => {
                        if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('folder-name') || (e.target as HTMLElement).classList.contains('folder-count') || (e.target as HTMLElement).classList.contains('folder-color')) {
                          setSelectedFolder(folder.id)
                        }
                      }}
                    >
                      <div className="folder-color" style={{ backgroundColor: folder.color }} />
                      <span className="folder-name">{folder.name}</span>
                      <span className="folder-count">
                        {applications.filter(app => app.folderId === folder.id).length}
                      </span>
                    </div>
                    <button
                      className="folder-edit"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingFolder(folder)
                        setShowFolderModal(true)
                      }}
                      title="Rename folder"
                    >
                      ✎
                    </button>
                    <button
                      className="folder-delete"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`Delete folder "${folder.name}"? Applications will be moved to "All Applications".`)) {
                          deleteFolder(folder.id)
                        }
                      }}
                      title="Delete folder"
                    >
                      ×
                    </button>
                  </DroppableFolder>
                ))}
              </SortableContext>
            </ul>
            <button
              className="btn btn-secondary btn-small"
              style={{ marginTop: '12px', width: '100%' }}
              onClick={() => setShowFolderModal(true)}
            >
              + New Folder
            </button>
          </div>
        </aside>

        <div className={`content-area ${currentFolder?.wallpaper ? 'has-wallpaper' : ''}`} style={contentAreaStyle}>
          <div className="toolbar">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {selectedApplications.size > 0 && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  {selectedApplications.size} selected
                </span>
                <button
                  className="btn btn-secondary btn-small"
                  onClick={bulkDeleteApplications}
                  style={{ backgroundColor: '#ef4444', color: 'white' }}
                >
                  Delete Selected
                </button>
              </div>
            )}
          </div>

          <div className="table-container">
            {filteredApplications.length === 0 ? (
              <div className="empty-state">
                <h3>No applications yet.</h3>
                <button className="btn btn-primary" onClick={() => setShowApplicationModal(true)}>
                  + New Application
                </button>
              </div>
            ) : (
              <table className="applications-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>
                      <input
                        type="checkbox"
                        checked={filteredApplications.length > 0 && selectedApplications.size === filteredApplications.length}
                        onChange={toggleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    {allVisibleColumns.map(col => (
                      <th key={col.id} onClick={() => handleSort(col.id as any)}>
                        {col.label} {sortBy === col.id && (sortDesc ? '↓' : '↑')}
                      </th>
                    ))}
                    <th style={{ width: '80px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map(app => (
                    <DraggableRow key={app.id} id={app.id} onClick={() => handleEdit(app)}>
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedApplications.has(app.id)}
                          onChange={() => toggleSelectApplication(app.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      {allVisibleColumns.map(col => (
                        <td key={col.id}>
                          {col.id === 'status' ? (
                            <span
                              className="status-badge"
                              style={{ backgroundColor: STATUS_COLORS[app.status] }}
                            >
                              {app.status}
                            </span>
                          ) : col.id === 'link' && app.link ? (
                            <a
                              href={app.link.startsWith('http') ? app.link : `https://${app.link}`}
                              className="link-cell"
                              onClick={(e) => e.stopPropagation()}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {app.link}
                            </a>
                          ) : col.id === 'location' && app.location ? (
                            <span className="location-cell">
                              {app.location}
                              {app.location && (
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(app.location)}`}
                                  className="map-link"
                                  onClick={(e) => e.stopPropagation()}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="View on Google Maps"
                                >
                                  📍
                                </a>
                              )}
                            </span>
                          ) : col.id === 'folderId' ? (
                            app.folderId ? (
                              <span className="folder-badge" style={{
                                backgroundColor: folders.find(f => f.id === app.folderId)?.color || '#6b7280',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '500'
                              }}>
                                {folders.find(f => f.id === app.folderId)?.name || 'Unknown'}
                              </span>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '13px' }}>No folder</span>
                            )
                          ) : col.id.toString().startsWith('custom_') ? (
                            app.customFields?.[col.id] || ''
                          ) : (
                            app[col.id]
                          )}
                        </td>
                      ))}
                      <td>
                        <button
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm('Delete this application?')) {
                              deleteApplication(app.id)
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </DraggableRow>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showApplicationModal && (
        <ApplicationModal
          application={editingApplication}
          folders={folders}
          customColumns={customColumns}
          defaultFolderId={editingApplication ? undefined : selectedFolder}
          onSave={(app) => {
            if (editingApplication) {
              updateApplication(editingApplication.id, app)
            } else {
              addApplication(app)
            }
            handleModalClose()
          }}
          onClose={handleModalClose}
        />
      )}

      {showColumnToggle && (
        <ColumnToggle
          columns={DEFAULT_COLUMNS}
          customColumns={customColumns}
          visibleColumns={visibleColumns}
          onToggle={(columnId) => {
            const updated = visibleColumns.includes(columnId)
              ? visibleColumns.filter(id => id !== columnId)
              : [...visibleColumns, columnId]
            setVisibleColumns(updated)
            saveData()
          }}
          onToggleCustom={(columnId) => {
            const updated = customColumns.map(col =>
              col.id === columnId ? { ...col, visible: !col.visible } : col
            )
            setCustomColumns(updated)
          }}
          onClose={() => setShowColumnToggle(false)}
        />
      )}

      {showImportModal && (
        <ImportModal
          onImport={(importedApps) => {
            const updated = [...applications, ...importedApps]
            setApplications(updated)
            saveData(updated)
            setShowImportModal(false)
          }}
          onClose={() => setShowImportModal(false)}
        />
      )}

      {showFolderModal && (
        <FolderModal
          folder={editingFolder}
          onSave={(name, color, wallpaper) => {
            if (editingFolder) {
              updateFolder(editingFolder.id, name, color, wallpaper)
            } else {
              addFolder(name, color, wallpaper)
            }
            setShowFolderModal(false)
            setEditingFolder(null)
          }}
          onClose={() => {
            setShowFolderModal(false)
            setEditingFolder(null)
          }}
        />
      )}

      {showCustomColumnsModal && (
        <CustomColumnsModal
          columns={customColumns}
          onSave={(columns) => {
            setCustomColumns(columns)
            setShowCustomColumnsModal(false)
          }}
          onClose={() => setShowCustomColumnsModal(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          settings={{ darkMode, accentColor, accentColorHover, backgroundColor, backgroundColorSecondary }}
          onSave={(settings) => {
            setDarkMode(settings.darkMode)
            if (settings.accentColor) setAccentColor(settings.accentColor)
            if (settings.accentColorHover) setAccentColorHover(settings.accentColorHover)
            if (settings.backgroundColor) setBackgroundColor(settings.backgroundColor)
            if (settings.backgroundColorSecondary) setBackgroundColorSecondary(settings.backgroundColorSecondary)
          }}
          onClose={() => setShowSettingsModal(false)}
          onClearAllApplications={clearAllApplications}
          applicationCount={applications.length}
        />
      )}
    </div>
    </DndContext>
  )
}

export default App
