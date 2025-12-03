export type ApplicationStatus = 'Applied' | 'Interview' | 'Rejected' | 'Offer' | 'Wishlist'

export interface JobApplication {
  id: string
  company: string
  position: string
  status: ApplicationStatus
  link: string
  dateApplied: string
  deadline: string
  location: string
  salary: string
  notes: string
  folderId: string | null
  createdAt: string
  updatedAt: string
  customFields?: Record<string, any>
}

export interface Folder {
  id: string
  name: string
  color: string
  createdAt: string
  order?: number
}

export type FieldType = 'text' | 'number' | 'date' | 'dropdown'

export interface CustomColumn {
  id: string
  label: string
  type: FieldType
  options?: string[]
  visible: boolean
  width?: number
}

export interface ColumnConfig {
  id: keyof JobApplication
  label: string
  visible: boolean
  width?: number
}

export interface ThemeSettings {
  darkMode: boolean
  accentColor?: string
  accentColorHover?: string
  backgroundColor?: string
  backgroundColorSecondary?: string
}

export interface AppData {
  applications: JobApplication[]
  folders: Folder[]
  settings: {
    visibleColumns: string[]
    darkMode?: boolean
    customColumns?: CustomColumn[]
    accentColor?: string
    accentColorHover?: string
    backgroundColor?: string
    backgroundColorSecondary?: string
  }
}

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'company', label: 'Company', visible: true, width: 150 },
  { id: 'position', label: 'Position', visible: true, width: 180 },
  { id: 'status', label: 'Status', visible: true, width: 120 },
  { id: 'dateApplied', label: 'Date Applied', visible: true, width: 120 },
  { id: 'deadline', label: 'Deadline', visible: true, width: 120 },
  { id: 'location', label: 'Location', visible: true, width: 150 },
  { id: 'salary', label: 'Salary', visible: false, width: 120 },
  { id: 'link', label: 'Link', visible: true, width: 200 },
  { id: 'folderId', label: 'Folder', visible: true, width: 120 },
  { id: 'notes', label: 'Notes', visible: true, width: 250 }
]

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  'Applied': '#3b82f6',
  'Interview': '#f59e0b',
  'Rejected': '#ef4444',
  'Offer': '#10b981',
  'Wishlist': '#8b5cf6'
}
