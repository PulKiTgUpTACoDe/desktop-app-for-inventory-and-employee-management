import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { employeeHandlers } from './handlers/employee_handlers.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = fileURLToPath(new URL('.', import.meta.url))

const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js')
    },
    icon: join(__dirname, '../assets/icon.png'),
    show: false
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    // In production, load the built files
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Handle window closed
  mainWindow.on('closed', () => {
    // Dereference the window object
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}


employeeHandlers()

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
