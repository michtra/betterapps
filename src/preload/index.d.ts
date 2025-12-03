export interface ElectronAPI {
  loadData: () => Promise<any>
  saveData: (data: any) => Promise<{ success: boolean; error?: string }>
  exportFile: (data: string, format: string) => Promise<{ success: boolean; filePath?: string; canceled?: boolean; error?: string }>
  importFile: () => Promise<{ success: boolean; data?: string; extension?: string; filePath?: string; canceled?: boolean; error?: string }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
