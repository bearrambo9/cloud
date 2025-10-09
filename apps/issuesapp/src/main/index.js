const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const Registry = require('winreg')
const axios = require('axios')
const ip = '192.168.1.165:3000'

let cloudClientId

const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 475,
    height: 585,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:4000')
  } else {
    const indexPath = path.join(__dirname, '../renderer/index.html')
    mainWindow.loadFile(indexPath)
  }

  const cloudKey = new Registry({
    hive: Registry.HKCU,
    key: '\\SOFTWARE\\Cloud'
  })

  cloudKey.get('id', (err, item) => {
    if (err) {
      console.error('Failed to read Cloud registry key:', err)
      mainWindow.close()
    } else {
      cloudClientId = item.value
    }
  })
}

ipcMain.handle('submit-issue', async (_, issueData) => {
  if (!cloudClientId) return { error: 'Client ID not found' }

  try {
    issueData.clientId = cloudClientId

    const response = await axios.post(`http://${ip}/uploadIssue`, issueData)

    if (response.data.status === 'success') {
      return { status: 'success', issueNumber: response.data.issueNumber }
    } else {
      return { error: response.data.error }
    }
  } catch (err) {
    console.error('Network error:', err)
    return { error: 'Network error occurred' }
  }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
