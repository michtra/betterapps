import { contextBridge, ipcRenderer } from 'electron'

const api = {
  loadData: () => ipcRenderer.invoke('load-data'),
  saveData: (data: any) => ipcRenderer.invoke('save-data', data),
  exportFile: (data: string, format: string) => ipcRenderer.invoke('export-file', data, format),
  importFile: () => ipcRenderer.invoke('import-file')
}

contextBridge.exposeInMainWorld('electronAPI', api)

export type ElectronAPI = typeof api
