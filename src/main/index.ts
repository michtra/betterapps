import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { promises as fs } from 'fs'
import { writeFile, readFile } from 'fs/promises'

let mainWindow: BrowserWindow | null = null

const DATA_FILE = join(app.getPath('userData'), 'job-applications.json')

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#ffffff',
    show: false
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC Handlers
ipcMain.handle('load-data', async () => {
  try {
    const data = await readFile(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return { applications: [], folders: [], settings: { visibleColumns: [] } }
  }
})

ipcMain.handle('save-data', async (_event, data) => {
  try {
    await writeFile(DATA_FILE, JSON.stringify(data, null, 2))
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('export-file', async (_event, data, format) => {
  try {
    const { filePath, canceled } = await dialog.showSaveDialog({
      filters: [
        { name: format.toUpperCase(), extensions: [format] }
      ],
      defaultPath: `job-applications.${format}`
    })

    if (canceled || !filePath) {
      return { success: false, canceled: true }
    }

    await writeFile(filePath, data)
    return { success: true, filePath }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('import-file', async () => {
  try {
    const { filePaths, canceled } = await dialog.showOpenDialog({
      filters: [
        { name: 'Spreadsheets', extensions: ['xlsx', 'csv'] }
      ],
      properties: ['openFile']
    })

    if (canceled || filePaths.length === 0) {
      return { success: false, canceled: true }
    }

    const filePath = filePaths[0]
    const data = await readFile(filePath)
    const extension = filePath.split('.').pop()?.toLowerCase()

    return {
      success: true,
      data: data.toString('base64'),
      extension,
      filePath
    }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})
