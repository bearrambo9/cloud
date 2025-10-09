const { contextBridge, ipcRenderer } = require('electron')

const api = {
  submitIssue: (data) => ipcRenderer.invoke('submit-issue', data)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electronAPI = api
}
